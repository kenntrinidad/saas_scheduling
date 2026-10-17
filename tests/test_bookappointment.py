from playwright.sync_api import sync_playwright
import time
from faker import Faker
from datetime import datetime, timedelta
import random

fake = Faker()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    for i in range(10):
        print(f"\n--- Starting booking {i + 1} of 10 ---")
        
        name = fake.name()
        contacts = fake.phone_number()
        email = fake.email()
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        random_hour = random.randint(9, 17)
        random_minute = random.choice([0, 15, 30, 45])
        random_time = f"{random_hour:02d}:{random_minute:02d}"

        print("Navigating to booking page...")
        page.goto("https://saas-scheduling.vercel.app/book")

        if i == 0:
            print("Booking Page Title:", page.title())

        time.sleep(2)

        page.fill('input[placeholder="Your name"]', name)
        page.fill('input[placeholder="09XXXXXXXXX"]', contacts)
        page.fill('input[placeholder="you@email.com"]', email)
        page.fill('input[type="date"]', tomorrow)
        page.fill('input[type="time"]', random_time)
        print(f"Filled form with: Name={name}, Contacts={contacts}, Email={email}, Date={tomorrow}, Time={random_time}")

        page.click('button[type="submit"]')
        print("Form submitted, waiting for confirmation...")

        page.wait_for_load_state("networkidle")
        time.sleep(2)

    print("Closing browser...")
    browser.close()