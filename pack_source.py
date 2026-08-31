import zipfile, os, time

src = r"D:\projects\dmkl61"
dst = r"D:\AI生成文件地址\dmkl61-source-20260821.zip"
exclude_dirs = {"node_modules", "target", ".git", "dist", "dist-package", "src-tauri/gen", ".dmkl61"}
exclude_files = {".DS_Store", "Thumbs.db", "*.log", "create_repo.py", "fetch_readme.py"}

print("Start packaging...")
t0 = time.time()
z = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED, allowZip64=True)
count = 0
total_size = 0

for root, dirs, files in os.walk(src):
    # 过滤目录
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    rel_root = os.path.relpath(root, src)
    for f in files:
        if f in exclude_files or any(f.endswith(e.replace("*","")) for e in exclude_files):
            continue
        fp = os.path.join(root, f)
        arcname = os.path.join(rel_root, f) if rel_root != "." else f
        try:
            size = os.path.getsize(fp)
            z.write(fp, arcname)
            count += 1
            total_size += size
        except Exception as e:
            print(f"  SKIP {arcname}: {e}")

z.close()
elapsed = time.time() - t0
z_size = os.path.getsize(dst)
print(f"Done in {elapsed:.1f}s")
print(f"Files: {count}")
print(f"Source size: {total_size/1024/1024:.1f} MB")
print(f"Zip size: {z_size/1024/1024:.1f} MB")
print(f"Ratio: {total_size/z_size:.1f}x")
print(f"Output: {dst}")
