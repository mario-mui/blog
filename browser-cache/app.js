const Koa = require('koa');
var views = require('koa-views');
const static = require('koa-static');
const md5File = require('md5-file');
const app = new Koa();

app.use(async (ctx, next) => {
  if(ctx.url === '/image.png') {
    ctx.set('cache-control', `max-age=${60 * 60}`);
  }
  if(ctx.url === '/test.js') {
    const hash = md5File.sync('./static/test.js')
    if (ctx.get('if-none-match') == hash) {
      return ctx.status = 304;
    }
    ctx.set('etag', hash)
  }
  return await next()
});

app.use(static(__dirname+ '/static'));

app.use(views(__dirname));

app.use(async (ctx, next) => {
  return await ctx.render('index.html')
});

app.listen(3030);
console.log('====== server in 3030 ====')