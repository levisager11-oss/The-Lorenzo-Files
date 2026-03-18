from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Capture screenshot immediately after navigation without login bypass
        page.screenshot(path="pre_login_screenshot.png")
        print("Captured pre-login screenshot.")

        # Now fill in the password and see what happens
        # I need to know the correct password
        password = "your_clearance_code_here" # from .env.example

        # Let's see if the VITE_SITE_PASSWORD is set in the environment or what the app expects
        # In test_login2.py, setting sessionStorage to GRANTED bypassed login.
        # But wait, the user's report is: "after entering the password, the website no longer loads, and just presents a blue screen"
        # In the LoginScreen component, if password is correct, it calls `onLoginSuccess()`.

        # Maybe the blue screen is NOT the main app screen but literally a solid blue screen or a crash?
        # Let's simulate clicking the login button.
        page.fill("input[name='password']", "your_clearance_code_here")
        page.click("button[type='submit']")

        time.sleep(2)
        page.screenshot(path="post_login_submit_screenshot.png")
        print("Captured post-login submit screenshot.")

        browser.close()

if __name__ == "__main__":
    run()
