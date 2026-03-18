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

        # Set loading to false so we skip the "ACCESSING CLOUD EVIDENCE ARCHIVE..." screen
        # actually, the App.jsx reads from firebase and loading stays true forever in tests because we can't reach firebase.
        # But wait, the user's issue might be specifically what happens when loading is false. Let's patch App.jsx to set loading=false immediately.
        browser.close()

if __name__ == "__main__":
    run()
