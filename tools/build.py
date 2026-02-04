import os
import shutil
import re
import datetime

SRC_DIR = '../src'
DIST_DIR = '../dist'

def clean_dist():
    if os.path.exists(DIST_DIR):
        print(f"Cleaning {DIST_DIR}...")
        # Handle potential permission errors on Windows
        def on_rm_error(func, path, exc_info):
            import stat
            os.chmod(path, stat.S_IWRITE)
            func(path)
            
        try:
            shutil.rmtree(DIST_DIR, onerror=on_rm_error)
        except Exception as e:
            print(f"Warning: Could not delete {DIST_DIR}: {e}")
            print("Attempting to overwrite files instead...")
    
    if not os.path.exists(DIST_DIR):
        os.makedirs(DIST_DIR)

def copy_assets():
    # Copy assets folder
    src_assets = os.path.join(SRC_DIR, 'assets')
    dist_assets = os.path.join(DIST_DIR, 'assets')
    if os.path.exists(src_assets):
        shutil.copytree(src_assets, dist_assets)
    else:
        os.makedirs(dist_assets)
    
    # Copy manifest and sw
    shutil.copy(os.path.join(SRC_DIR, 'manifest.json'), os.path.join(DIST_DIR, 'manifest.json'))
    shutil.copy(os.path.join(SRC_DIR, 'sw.js'), os.path.join(DIST_DIR, 'sw.js'))
    extra_files = [
        'ads.txt',
        'robots.txt',
        'sitemap.xml',
        'pricing.html',
        'privacy.html',
        'terms.html'
    ]
    for file_name in extra_files:
        src_file = os.path.join(SRC_DIR, file_name)
        if os.path.exists(src_file):
            shutil.copy(src_file, os.path.join(DIST_DIR, file_name))

def minify_css(content):
    # Remove comments
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    # Remove whitespace
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\s*([:;{}])\s*', r'\1', content)
    return content

def minify_js(content):
    # Simple JS minifier (Safer version)
    # Remove multi line comments
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    
    # Process lines to remove leading/trailing whitespace but keep newlines
    # This avoids issues with single line comments // swallowing code if lines are merged
    lines = [line.strip() for line in content.split('\n')]
    # Remove empty lines
    lines = [line for line in lines if line]
    
    return '\n'.join(lines)

def minify_html(content):
    # Remove comments
    content = re.sub(r'<!--(?!\[if).*?-->', '', content, flags=re.DOTALL)
    # Remove whitespace between tags
    content = re.sub(r'>\s+<', '><', content)
    return content

def build():
    print("Starting Build Process...")
    clean_dist()
    
    # Process CSS
    print("Processing CSS...")
    os.makedirs(os.path.join(DIST_DIR, 'css'))
    shutil.copy(os.path.join(SRC_DIR, 'css/style.css'), os.path.join(DIST_DIR, 'css/style.css'))

    # Process JS
    print("Processing JS...")
    os.makedirs(os.path.join(DIST_DIR, 'js'))
    
    # Process app.js
    shutil.copy(os.path.join(SRC_DIR, 'js/app.js'), os.path.join(DIST_DIR, 'js/app.js'))

    # Process auth.js
    shutil.copy(os.path.join(SRC_DIR, 'js/auth.js'), os.path.join(DIST_DIR, 'js/auth.js'))

    # Process HTML
    print("Processing HTML...")
    with open(os.path.join(SRC_DIR, 'index.html'), 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Add cache busting
    timestamp = int(datetime.datetime.now().timestamp())
    html_content = html_content.replace('css/style.css', f'css/style.css?v={timestamp}')
    html_content = html_content.replace('js/app.js', f'js/app.js?v={timestamp}')
    html_content = html_content.replace('js/auth.js', f'js/auth.js?v={timestamp}')
    
    minified_html = minify_html(html_content)
    with open(os.path.join(DIST_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(minified_html)

    copy_assets()
    print(f"Build completed successfully in {DIST_DIR}")

if __name__ == '__main__':
    build()
