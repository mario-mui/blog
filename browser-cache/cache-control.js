const Koa = require('koa');
var views = require('koa-views');
const static = require('koa-static');
const app = new Koa();

app.use(async (ctx, next) => {
  if(ctx.url === '/test.js' || ctx.url === '/image.png') {
    ctx.set('cache-control', `max-age=${60 * 60}`);
  }
  await next()
});

app.use(static(__dirname+ '/static'));

app.use(views(__dirname));

app.use(async (ctx, next) => {
  return await ctx.render('index.html')
});

app.listen(3030);
console.log('====== server in 3030 ====')