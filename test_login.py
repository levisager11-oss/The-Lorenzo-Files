from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))

        # Capture page errors
        page.on("pageerror", lambda err: print(f"Page Error: {err.message}"))

        page.goto("http://localhost:5173")
        page.wait_for_timeout(2000)

        # Evaluate to set sessionStorage since the UI check depends on it
        page.evaluate("sessionStorage.setItem('lorenzo_clearance', 'GRANTED')")
        page.reload()
        page.wait_for_timeout(2000)

        # Output current page contents
        page.screenshot(path="post_login.png")
        print("Done capturing after fake login")
        browser.close()

run()
