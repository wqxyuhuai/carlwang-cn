
# carlwang.cn

This is the source project for carlwang.cn.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

Run `npm run build` to create the production build in `dist/`.

## Moving Between Computers

The project is portable across different OneDrive drive letters, such as `D:` on one computer and `E:` on another. Project configuration uses paths relative to the repository root, so open the synced `Source` folder directly and run commands there.

Recommended OneDrive location on this computer:

```text
E:\OneDrive\Design files sync\AI\Proj. carlwang.cn\Source
```

Copy this project into that folder with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\copy-to-onedrive.ps1
```

If the same OneDrive folder is mounted on `D:` on another computer, pass that path explicitly:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\copy-to-onedrive.ps1 -Target "D:\OneDrive\Design files sync\AI\Proj. carlwang.cn\Source"
```

Do not sync or copy generated folders unless you specifically need them:

- `node_modules/` can be recreated with `npm i`.
- `dist/` can be recreated with `npm run build`.
- `vite-dev.log` is a local log file.

Create `.env.local` from `.env.example` on each computer, or copy the existing `.env.local` only if you are comfortable syncing those secrets through OneDrive.

## Content Sync

Run `npm run sync:notion` from the project folder to sync Notion content and upload media. The script always loads `.env.local` from the repository root, even if it is launched from another working directory.
