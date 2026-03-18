from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")
        page.evaluate("sessionStorage.setItem('lorenzo_clearance', 'GRANTED')")
        page.reload()
        page.wait_for_timeout(3000)

        # Capture computed background color of body and root
        body_bg = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        root_bg = page.evaluate("window.getComputedStyle(document.getElementById('root')).backgroundColor")

        print(f"Body bg: {body_bg}")
        print(f"Root bg: {root_bg}")

        browser.close()

if __name__ == "__main__":
    run()
