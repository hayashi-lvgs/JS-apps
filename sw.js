// サービスワーカー：オフラインでもアプリを開けるようにする
// キャッシュの名前。アプリを更新したらバージョン番号を上げる
const CACHE_NAME = "daily-study-v1";

// オフラインでも使えるよう保存しておくファイル一覧
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

// インストール時：上のファイルを全部スマホに保存する
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// 有効化時：古いキャッシュがあれば消す（更新対応）
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ファイルが要求されたとき：
// まずネットから取りに行き、成功したらキャッシュも更新。
// ネットが無い・失敗したら、保存しておいたキャッシュを返す。
// （こうすると、ネットがあるときは常に最新、無いときはオフライン版）
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request).then((res) => res || caches.match("./index.html")))
  );
});
