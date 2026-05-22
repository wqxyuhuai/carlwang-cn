# carlwang.cn

一个最简单的静态网站：打开后显示随机渐变背景，并展示当前使用的两个色值。

## 本地查看

直接双击 `index.html` 即可在浏览器打开。

如果你想用本地服务器查看，可以在这个目录运行：

```bash
npx serve .
```

## 部署到域名

最省事的方式是使用 Cloudflare Pages、Vercel 或 Netlify：

1. 把这个目录上传到 GitHub 仓库。
2. 在托管平台导入这个仓库。
3. 构建命令留空，发布目录填根目录 `/`。
4. 在平台里绑定自定义域名 `carlwang.cn`。
5. 按平台提示，到你的域名 DNS 里添加对应的 `CNAME` 或 `A` 记录。

部署完成后，访问 `https://carlwang.cn` 就能看到页面。
