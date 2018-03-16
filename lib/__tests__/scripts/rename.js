module.exports = function (data, callback) {
  callback({
    commits: data.commits.map((c) => `renamed from ${c.title}`)
  });
}
