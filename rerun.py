from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))

        # Capture page errors
        page.on("pageerror", lambda err: print(f"Page Error: {err.message}"))

        page.goto("http://localhost:5173")
        page.evaluate("sessionStorage.setItem('lorenzo_clearance', 'GRANTED')")
        page.reload()
        page.wait_for_timeout(2000)

        # Inject script to set loading=false via some global or just observe if the blue screen shows
        page.screenshot(path="post_login.png")
        print("Done capturing after fake login")
        browser.close()

if __name__ == "__main__":
    run()
