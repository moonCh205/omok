// 1. indexedDB 객체 가져오기
const idxedDB = window.indexedDB;
// https://mong-blog.tistory.com/entry/indexedDB%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90
// 2. 브라우저에서 지원하는지 체크하기
if (!idxedDB) window.alert('해당 브라우저에서는 indexedDB를 지원하지 않습니다.');
else {
  let db;
  const request = idxedDB.open('SampleDB'); // 3. SampleDB(db) 열기

  request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore('name', { keyPath: 'id' }); // 4. name저장소 만들고, key는 id로 지정
    request.onerror = (e) => alert('failed');
    request.onsuccess = (e) => (db = request.result); // 5. 성공시 db에 result를 저장
  };
}
function writeIdxedDB(names) {
  const request = window.indexedDB.open('SampleDB');
  request.onerror = (e) => {
    alert('DataBase error', e.target.errorCode);
  };
  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction(['name'], 'readwrite');
    //person 객체 저장소에 읽기&쓰기 권한으로 transaction 생성

    // 완료, 실패 이벤트 처리
    transaction.oncomplete = (e) => {
      console.log('success');
    };
    transaction.onerror = (e) => {
      console.log('fail');
    };

    // transaction으로
    const objStore = transaction.objectStore('name');
    for (const name of names) {
      const request = objStore.add(name); // 저장
      request.onsuccess = (e) => console.log(e.target.result);
    }
  };
}

//   const names = [{id: 1, name: 'a'}, {id: 2, name: 'b'}, {id: 3, name: 'c'}];

//   writeIdxedDB(names);
function getIdxedDBValue(key) {
  const request = window.indexedDB.open('SampleDB'); // 1. DB 열기
  request.onerror = (e) => console.log(e.target.errorCode);

  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction('name');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');

    const objStore = transaction.objectStore('name');
    const objStoreRequest = objStore.get(key); // 2. get으로 데이터 접근
    objStoreRequest.onsuccess = (e) => {
      console.log(objStoreRequest.result);
    };
  };
}
//   getIdxedDBValue(1);  // { id:1, name:"a" }

function updateIdxedDBValue(key, value) {
  const request = window.indexedDB.open('SampleDB'); // 1. db 열기
  request.onerror = (e) => console.log(e.target.errorCode);

  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction('name', 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');

    const objStore = transaction.objectStore('name'); // 2. name 저장소 접근
    const objStoreRequest = objStore.get(key); // 3. key값으로 데이터 접근
    objStoreRequest.onsuccess = (e) => {
      const updateRequest = objStore.put(value); // 4. 수정
      updateRequest.onerror = (e) => console.log('udpate error');
      updateRequest.onsuccess = (e) => console.log('success');
    };
  };
}
//   updateIdxedDBValue(1, {id: 1, name: 'vvvv'});
//   updateIdxedDBValue(2, {id: 2, name: 'bbbbb'});
function deleteIdxedDBValue(key) {
  const request = window.indexedDB.open('SampleDB'); // 1. db 열기
  request.onerror = (e) => console.log(e.target.errorCode);

  request.onsuccess = (e) => {
    const db = request.result;
    const transaction = db.transaction('name', 'readwrite');
    transaction.onerror = (e) => console.log('fail');
    transaction.oncomplete = (e) => console.log('success');

    const objStore = transaction.objectStore('name'); // 2. name 저장소 접근
    const objStoreRequest = objStore.delete(key); // 3. 삭제하기
    objStoreRequest.onsuccess = (e) => {
      console.log('deleted');
    };
  };
}
//   deleteIdxedDBValue(1);
