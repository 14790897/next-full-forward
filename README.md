# full-forward-proxy

本项目尽全力将网页上的内容全部通过 next的路由 进行代理, 目前发现对谷歌，油管不适配

## 使用方法

1. 访问域名主页，如我部署的https://forward.paperai.life ，自动安装service worker
2. 在任意 url 前面加上 https://你的域名/proxy/ 例如 https://forward.paperai.life/proxy/https://github.com/14790897

## 自己搭建步骤


1. 克隆仓库并切换到仓库目录
2. 开发
   ```sh
	npm run dev
	```

## 功能

- 代理功能：拦截并通过 Cloudflare Worker 转发到目标网站的请求。
- 自动 URL 重写：修改 HTML 内容中的相对 URL，使它们通过代理加载。
- Cookie 记录：在 Cookie 中存储当前访问的目标网站，以便处理后续特殊地直接对根路径请求时不需要再次提供完整的 URL。
- service worker: 拦截非代理网站的请求，使得它们也走代理

## 体验网址

https://forward.paperai.life

## 演示视频

https://file.paperai.life/%E6%97%A0%E4%BB%A3%E7%90%86%E5%9B%BD%E5%86%85%E8%AE%BF%E9%97%AEpornhub%E6%96%B9%E6%B3%95.mp4

## 参考项目: https://github.com/gaboolic/cloudflare-reverse-proxy


# cf page有个bug就是选择仓库的子目录作为根目录的话，在使用@的时候他会直接获得到仓库目录的文件而不是我们指定的根目录的文件导致错误
