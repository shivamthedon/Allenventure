from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/#/admin")
    page.wait_for_timeout(5000)
    page.screenshot(path="jules-scratch/verification/admin_page.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)