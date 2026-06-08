# Carl Wang Glass Navigation Kit

这个包只迁移当前导航栏的视觉层，不接管 `carlwang.cn` 项目已有的交互、路由、主题按钮逻辑和字体系统。

## 文件

- `glass-nav.css`: 当前液态玻璃导航视觉。所有 class 用 `cw-` 前缀，变量用 `--cw-` 前缀。
- `GlassDistortionFilter.tsx`: Next/React 里放一次的 SVG filter。

## 推荐接入方式

1. 把 `glass-nav.css` 复制到项目，例如：

```powershell
Copy-Item "C:\Users\Administrator\Documents\Codex\2026-06-04\new-chat\outputs\carlwang-glass-nav-kit\glass-nav.css" "C:\Users\Administrator\Documents\carlwang.cn\src\app\glass-nav.css"
```

2. 在 `src/app/layout.tsx` 或 `src/app/globals.css` 已经被导入的位置引入 CSS：

```tsx
import "./glass-nav.css";
```

3. 把 `GlassDistortionFilter.tsx` 复制到组件目录，例如：

```powershell
Copy-Item "C:\Users\Administrator\Documents\Codex\2026-06-04\new-chat\outputs\carlwang-glass-nav-kit\GlassDistortionFilter.tsx" "C:\Users\Administrator\Documents\carlwang.cn\src\app\components\GlassDistortionFilter.tsx"
```

4. 在根布局或导航组件里渲染一次 filter：

```tsx
import { GlassDistortionFilter } from "./components/GlassDistortionFilter";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <GlassDistortionFilter />
        {children}
      </body>
    </html>
  );
}
```

如果你的路径不是 `src/app/components`，按实际路径改 import。

## 导航结构映射

保留你项目已有的导航内容、Link、pathname 判断、主题切换事件，只给外层加这些视觉 class：

```tsx
<header className="cw-glass-header">
  <nav className="cw-glass-wrapper" aria-label="主导航">
    <span className="cw-glass-effect" />
    <div className="cw-glass-content">
      <Link className="cw-brand" href="/">
        <span>Carl Wang</span>
        <span className="cw-brand-muted">- studio</span>
      </Link>

      <div className="cw-nav-links">
        <Link className={`cw-nav-link ${isHome ? "is-active" : ""}`} href="/">Home</Link>
        <Link className={`cw-nav-link ${isWork ? "is-active" : ""}`} href="/work">Work</Link>
        <Link className={`cw-nav-link ${isLab ? "is-active" : ""}`} href="/lab">Lab</Link>
        <Link className={`cw-nav-link ${isAbout ? "is-active" : ""}`} href="/about">About</Link>
        <Link className={`cw-nav-link ${isStudio ? "is-active" : ""}`} href="/studio">Studio</Link>
      </div>

      <div className="cw-nav-tools">
        <button className="cw-theme-toggle" type="button" onClick={toggleTheme} aria-label="切换主题">
          {/* 保留项目里的月亮/太阳 icon */}
        </button>
        <Link className="cw-nav-action" href="/contact">Contact <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </nav>
</header>
```

重点：

- `is-active` 继续由你项目现有 pathname/状态逻辑控制。
- 不要复制这里的 `font-family`，CSS 包也没有设置 `font-family`。
- 如果项目已有 Header 组件，只需要把 class 套到对应层级，不需要重写交互。

## 二级 tab 映射

如果你的项目里 Work/Lab 已经有二级 tab，只加这些 class：

```tsx
<section className={`cw-secondary-tabs ${showSecondary ? "is-visible" : ""}`} aria-hidden={!showSecondary}>
  <div className="cw-secondary-tabs-inner">
    <div className="cw-secondary-panel is-current">
      <div className="cw-secondary-tab-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`cw-secondary-tab ${activeTab === tab.value ? "is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <span className="cw-project-count">{countLabel}</span>
    </div>
  </div>
</section>
```

如果项目里是通过 `body.show-secondary` 控制显示，也可以继续用；CSS 已兼容：

```css
body.show-secondary .cw-secondary-tabs
```

## 主题适配

CSS 同时支持：

```html
<html data-theme="dark">
```

和：

```html
<html class="dark">
```

所以如果 `carlwang.cn` 已经有主题系统，不需要换逻辑，只要最终根节点上有 `data-theme="dark"` 或 `class="dark"` 即可。

## 验证

接入后运行：

```powershell
cd C:\Users\Administrator\Documents\carlwang.cn
npm run build
npm run dev
```

然后检查：

- SVG filter 只渲染一次，页面里有 `id="glass-distortion"`。
- 导航内容在 `.cw-glass-content` 里，不能放到 `.cw-glass-effect` 里。
- 当前路由的按钮 class 里有 `is-active`。
- Work/Lab 页面二级 tab 显示时有 `.cw-secondary-tabs.is-visible` 或 `body.show-secondary`。
