from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Test empty password. Wait, if it's undefined in .env...

        # Let's inspect import.meta.env
        env_vars = page.evaluate("Object.keys(import.meta.env)")
        print(f"Env vars: {env_vars}")

        # Since I'm starting it via Vite dev server, if there's no .env file, VITE_SITE_PASSWORD might be undefined.
        pwd = page.evaluate("import.meta.env.VITE_SITE_PASSWORD")
        print(f"VITE_SITE_PASSWORD: {pwd}")

        # What happens if we log in with empty string when it's undefined?
        # Actually I can't evaluate import.meta.env like this in page.evaluate directly easily if it's bundled.

        browser.close()

if __name__ == "__main__":
    run()
