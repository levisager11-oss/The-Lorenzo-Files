from playwright.sync_api import sync_playwright
import subprocess
import time

def run():
    # Start the preview server
    print("Starting preview server...")
    process = subprocess.Popen(["npm", "run", "preview"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Log all errors
        page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: print(f"PageError: {err.message}"))

        print("Navigating to preview app...")
        page.goto("http://localhost:4173")
        page.evaluate("sessionStorage.setItem('lorenzo_clearance', 'GRANTED')")
        page.reload()
        page.wait_for_timeout(3000)

        # Check what elements are present
        body_html = page.evaluate("document.body.innerHTML")
        root_html = page.evaluate("document.getElementById('root') ? document.getElementById('root').innerHTML : 'No root'")
        print(f"Body snippet: {body_html[:500]}")

        page.screenshot(path="prod_blue_screen.png")
        print("Captured screenshot from prod build.")

        browser.close()

    process.kill()

if __name__ == "__main__":
    run()
