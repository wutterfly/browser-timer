use std::{
    collections::HashMap,
    sync::{atomic::AtomicU64, Arc, OnceLock},
    time::Instant,
};

use axum::{extract::State, response::IntoResponse, routing::post, Json, Router};
use log::info;
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

use crate::{
    data::{Data, DataHolder, Distributer},
    message::EventTyp,
    time,
};

static DATAHOLDER: OnceLock<Mutex<HashMap<u64, DataHolder>>> = OnceLock::new();
static RTT: OnceLock<Mutex<HashMap<u64, (u64, Instant)>>> = OnceLock::new();

static IDS: AtomicU64 = AtomicU64::new(0);

pub async fn start(dist: Arc<Distributer>, port: u16) -> Result<(), std::io::Error> {
    let app = Router::new()
        .route("/server/http", post(handle_request))
        .with_state(dist);
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await?;

    log::info!("listening on 0.0.0.0:{port}");

    axum::serve(listener, app).await
}

async fn handle_request(
    State(state): State<Arc<Distributer>>,
    Json(payload): Json<Request>,
) -> impl IntoResponse {
    let now = time::now();

    info!("{payload:?}");

    match payload {
        Request::Register {} => handle_register_msg(state).await,
        Request::Data {
            id,
            key,
            typ,
            key_code,
        } => handle_data_msg(now, id, key, typ, key_code).await,
        Request::Pong { id, ping } => handle_pong_msg(id, ping).await,
    }
}

async fn handle_register_msg(state: Arc<Distributer>) -> axum::http::Response<String> {
    let mut lock = DATAHOLDER.get_or_init(Default::default).lock().await;
    let mut lock_rtt = RTT.get_or_init(Default::default).lock().await;

    let id = IDS.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

    let new = state.new_connection();

    lock.insert(id, new);

    drop(lock);

    lock_rtt.insert(id, (1, Instant::now()));

    let json_string = serde_json::to_string(&Response {
        id,
        request_rtt: Some(1),
    })
    .unwrap();

    drop(lock_rtt);

    axum::response::Response::builder()
        .header("Content-Type", "application/json")
        .body(json_string)
        .unwrap()
}

async fn handle_pong_msg(id: u64, ping: u64) -> axum::http::Response<String> {
    let mut lock = DATAHOLDER.get().unwrap().lock().await;
    let mut lock_rtt = RTT.get().unwrap().lock().await;

    let data = lock.get_mut(&id).expect("We got an id");
    let (c, timestamp) = lock_rtt.get_mut(&id).expect("We got an id");

    if ping == *c {
        *c += 1;

        let elapsed = timestamp.elapsed().as_millis();

        data.update_rtt(elapsed);

        *timestamp = Instant::now();
    }

    drop(lock);
    drop(lock_rtt);

    let json_string = serde_json::to_string(&Response {
        id,
        request_rtt: None,
    })
    .unwrap();

    axum::response::Response::builder()
        .header("Content-Type", "application/json")
        .body(json_string)
        .unwrap()
}

async fn handle_data_msg(
    now: u128,
    id: u64,
    key: Box<str>,
    typ: EventTyp,
    key_code: i32,
) -> axum::http::Response<String> {
    let mut lock = DATAHOLDER.get().unwrap().lock().await;
    let data = lock.get_mut(&id).expect("We got an id");

    // make timestamp relative to first timestamp
    #[allow(clippy::cast_possible_truncation)]
    let relativ = (now - data.first_timestamp()) as u64;

    data.push(Data {
        key,
        timestamp: relativ,
        typ,
        key_code,
        current_rtt: data.rtt(),
    })
    .unwrap();

    drop(lock);

    let mut lock_rtt = RTT.get().unwrap().lock().await;
    let (c, timestamp) = lock_rtt.get_mut(&id).expect("We got an id");

    let request_rtt = if *c % 2 == 0 && timestamp.elapsed().as_secs() > 2 {
        *c += 1;
        *timestamp = Instant::now();
        Some(*c)
    } else {
        None
    };

    drop(lock_rtt);

    let json_string = serde_json::to_string(&Response { id, request_rtt }).unwrap();

    axum::response::Response::builder()
        .header("Content-Type", "application/json")
        .body(json_string)
        .unwrap()
}

#[derive(Debug, Serialize, Deserialize)]
enum Request {
    Register {},
    Data {
        id: u64,
        key: Box<str>,
        typ: EventTyp,
        key_code: i32,
    },

    Pong {
        id: u64,
        ping: u64,
    },
}

#[derive(Debug, Serialize)]
struct Response {
    id: u64,
    request_rtt: Option<u64>,
}

#[test]
fn test() {
    let r = Request::Data {
        id: 1,
        key: Box::from("a"),
        typ: EventTyp::KeyDown,
        key_code: 12,
    };

    let s = serde_json::to_string(&r).unwrap();

    println!("{s}");

    let r = Request::Pong { id: 123, ping: 12 };

    let s = serde_json::to_string(&r).unwrap();

    println!("{s}");

    let r = Request::Register {};

    let s = serde_json::to_string(&r).unwrap();

    println!("{s}");
}
