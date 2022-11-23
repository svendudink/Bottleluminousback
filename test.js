const getData = (slug) => {
  let data;
  db.serialize(() => {
    db.get("SELECT * FROM blog WHERE slug = ?", slug, (err, rows) => {
      data = rows;
    });
  });
  return data;
};

let data = getData("return-data-from-sqlite3-nodejs"); // => undefined

const getData = (slug) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get("SELECT * FROM blog WHERE slug = ?", slug, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  });
};

let promise = getData("return-data-from-sqlite3-nodejs") // => Promise { <pending> }
  .then((results) => {
    console.log(results); // => { slug: 'adding-matomo-website', read_times: 1, shares: 0, likes: 0 }
  });
