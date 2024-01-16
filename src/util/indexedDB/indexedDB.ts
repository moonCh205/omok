export class IdxedDbManager {
  error = '';
  dbName = '';
  indexedDB;
  request: { db?: IDBOpenDBRequest } = {};
  constructor(dbName: string) {
    const db = window.indexedDB;
    if (!db) {
      this.error = '지원 안 함';
    } else {
      this.indexedDB = db;
      this.dbName = dbName;
      this.openDb();
    }
  }
  openDb = () => {
    let db;
    this.request.db = this.indexedDB!.open(this.dbName);
    const request = this.request.db;
    request.onerror = (err) => console.error(`IndexedDB error: ${request.error}`, err);
    request.onsuccess = () => (db = request.result);
    // request.onupgradeneeded = () => {
    //  db = request.result;
    //   db.createObjectStore('name', { keyPath: 'id' }); // 4. name저장소 만들고, key는 id로 지정
    // };
    return this;
  };
  createTable = (tName: string,values: any) => {
    const request = this.request.db;
    if (request)
      request.onupgradeneeded = () => {
        const db = request.result;
        // db.createObjectStore(tName, { keyPath: 'id', autoIncrement: true }); // 4. tName저장소 만들고, key는 id로 지정
        db.createObjectStore(tName, { keyPath: 'id' });
        const transaction = db.transaction([tName], 'readwrite');
        //person 객체 저장소에 읽기&쓰기 권한으로 transaction 생성

        // 완료, 실패 이벤트 처리
        transaction.oncomplete = (e) => {
          console.log('success');
          // transaction으로
        };
        transaction.onerror = (e) => {
          console.log(e.target);
        };
        const objStore = transaction.objectStore(tName); // 2. name 저장소 접근
        const objStoreRequest = objStore.delete('1'); // 3. 기존에 있는 것 삭제하기
        //   const names = [{id: 1, name: 'a'}, {id: 2, name: 'b'}, {id: 3, name: 'c'}];
        for (const value of values) {
          const request = objStore.add(value); // 저장
          request.onsuccess = (e) => console.log(e);
        }
      };
    return this;
  };
  getDbValue = (tName: string, key: string) => {
    const request = this.request.db;
    if (request)
      request.onsuccess = (e) => {
        const db = request.result;
        const transaction = db.transaction(tName);
        transaction.onerror = (e) => console.log('fail');
        transaction.oncomplete = (e) => console.log('success');

        const objStore = transaction.objectStore(tName);
        const objStoreRequest = objStore.get(key); // 2. get으로 데이터 접근
        objStoreRequest.onsuccess = (e) => {
          console.log(objStoreRequest.result);
        };
      };
    //   getIdxedDBValue(1);  // { id:1, name:"a" }
    return this;
  };
  updateDbValue = (tName: string, key: string, value: string) => {
    const request = this.request.db;
    if (request)
      request.onsuccess = (e) => {
        const db = request.result;
        const transaction = db.transaction(tName, 'readwrite');
        transaction.onerror = (e) => console.log('fail');
        transaction.oncomplete = (e) => console.log('success');

        const objStore = transaction.objectStore(tName); // 2. name 저장소 접근
        const objStoreRequest = objStore.get(key); // 3. key값으로 데이터 접근
        objStoreRequest.onsuccess = (e) => {
          const updateRequest = objStore.put(value); // 4. 수정
          updateRequest.onerror = (e) => console.log('udpate error');
          updateRequest.onsuccess = (e) => console.log('success');
        };
      };

    //   updateIdxedDBValue(1, {id: 1, name: 'vvvv'});
    //   updateIdxedDBValue(2, {id: 2, name: 'bbbbb'});
    return this;
  };
  deleteDbValue = (tName: string, key: string) => {
    const request = this.request.db;
    if (request) {
      request.onsuccess = (e) => {
        const db = request.result;
        const transaction = db.transaction(tName, 'readwrite');
        transaction.onerror = (e) => console.log('fail');
        transaction.oncomplete = (e) => console.log('success');
        const objStore = transaction.objectStore(tName); // 2. name 저장소 접근
        const objStoreRequest = objStore.delete(key); // 3. 삭제하기
        request.onerror = (e) => {
          console.log(e);
        };
        objStoreRequest.onsuccess = (e) => {
          console.log('deleted');
        };
        objStoreRequest.onerror = (e) => {
          console.log(e);
        };
      };
    } else {
      console.log('진입실패');
    }

    //   deleteIdxedDBValue(1);
    return this;
  };
}
