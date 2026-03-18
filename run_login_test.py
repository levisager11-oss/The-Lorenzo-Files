from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err.message}"))

        page.goto("http://localhost:5173")

        # Simulate successful login
        page.evaluate("sessionStorage.setItem('lorenzo_clearance', 'GRANTED')")
        page.reload()

        page.wait_for_timeout(3000)

        print("Test complete.")
        browser.close()

if __name__ == "__main__":
    run()
