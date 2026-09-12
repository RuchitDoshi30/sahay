/**
 * Sahay UI Automated Tests
 * Run: node sahay_ui_tests.mjs
 * Requires: npx playwright (chromium)
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5173';
const SS_DIR = join(__dirname, 'screenshots');

try { mkdirSync(SS_DIR, { recursive: true }); } catch {}

function ss(name) { return join(SS_DIR, `${name}.png`); }

const results = [];

function log(test, step, status, detail = '') {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
    const msg = `${icon} [${test}] ${step}${detail ? ': ' + detail : ''}`;
    console.log(msg);
    results.push({ test, step, status, detail });
}

async function runTests() {
    const browser = await chromium.launch({ headless: false, slowMo: 400 });
    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();

    // ═══════════════════════════════════════════════
    // TEST 1: Profile Page State & Navigation
    // ═══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════');
    console.log('TEST 1: Profile Page State & Navigation');
    console.log('══════════════════════════════════════');

    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.screenshot({ path: ss('01_home') });
        log('Profile', 'Home page loads', 'PASS');

        // Click primary CTA
        const cta = page.locator('button, a').filter({ hasText: /get started|check eligibility|start|begin/i }).first();
        await cta.waitFor({ timeout: 5000 });
        await cta.click();
        await page.waitForURL('**/profile**', { timeout: 6000 });
        await page.screenshot({ path: ss('02_profile_page') });
        log('Profile', 'Navigate to Profile page', 'PASS');
    } catch (e) {
        log('Profile', 'Navigate to Profile page', 'FAIL', e.message);
        // Try direct navigation
        try {
            await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
            await page.screenshot({ path: ss('02_profile_page') });
            log('Profile', 'Direct navigate to /profile', 'PASS');
        } catch (e2) {
            log('Profile', 'Direct navigate to /profile', 'FAIL', e2.message);
        }
    }

    // Step 1: Click SC Certificate - "Yes, I have one"
    try {
        const scBtn = page.locator('button.choice-button, button[type="button"]').filter({ hasText: /yes.*have one|yes/i }).first();
        await scBtn.waitFor({ timeout: 5000 });
        await scBtn.click();
        log('Profile', 'Select SC Certificate: Yes', 'PASS');
    } catch (e) {
        log('Profile', 'Select SC Certificate', 'FAIL', e.message);
    }

    // Step 2: Scroll down and click an Income range button
    try {
        // Income buttons are below the fold — scroll to them first
        const incomeButtons = page.locator('button.choice-button');
        const count = await incomeButtons.count();
        // SC cert takes buttons 0 & 1 (Yes/No), income starts at 2
        const incomeBtn = incomeButtons.nth(Math.min(2, count - 1));
        await incomeBtn.scrollIntoViewIfNeeded();
        await incomeBtn.waitFor({ timeout: 5000 });
        await incomeBtn.click();
        log('Profile', 'Select Income range', 'PASS');
    } catch (e) {
        log('Profile', 'Select Income range', 'FAIL', e.message);
    }

    // Step 3: Scroll to and click purpose — Business
    try {
        const purposeBtn = page.locator('button.choice-button').filter({ hasText: /business/i }).first();
        await purposeBtn.scrollIntoViewIfNeeded();
        await purposeBtn.waitFor({ timeout: 5000 });
        await purposeBtn.click();
        log('Profile', 'Select purpose: Business', 'PASS');
    } catch (e) {
        log('Profile', 'Select purpose', 'FAIL', e.message);
    }

    // Step 4: Fill project cost
    try {
        const costInput = page.locator('input[type="number"]').first();
        await costInput.waitFor({ timeout: 3000 });
        await costInput.fill('100000');
        log('Profile', 'Fill project cost: 100000', 'PASS');
    } catch (e) {
        log('Profile', 'Fill project cost', 'FAIL', e.message);
    }

    // Step 5: Select activity type from dropdown
    try {
        const activitySelect = page.locator('select').first();
        await activitySelect.waitFor({ timeout: 3000 });
        const options = await activitySelect.locator('option').allTextContents();
        const validOption = options.find(o => o.trim() && o !== 'Select an activity' && o !== '');
        if (validOption) {
            await activitySelect.selectOption({ label: validOption });
            log('Profile', `Select activity type: "${validOption}"`, 'PASS');
        } else {
            log('Profile', 'Select activity type', 'FAIL', 'No valid options found');
        }
    } catch (e) {
        log('Profile', 'Select activity type', 'FAIL', e.message);
    }

    // Step 6: Fill State and District text inputs
    try {
        const stateInput = page.locator('input[placeholder*="Gujarat" i]').first();
        await stateInput.waitFor({ timeout: 3000 });
        await stateInput.fill('Gujarat');
        log('Profile', 'Fill state: Gujarat', 'PASS');
    } catch (e) {
        log('Profile', 'Fill state', 'FAIL', e.message);
    }

    try {
        const districtInput = page.locator('input[placeholder*="Rajkot" i]').first();
        await districtInput.waitFor({ timeout: 3000 });
        await districtInput.fill('Rajkot');
        log('Profile', 'Fill district: Rajkot', 'PASS');
    } catch (e) {
        log('Profile', 'Fill district', 'FAIL', e.message);
    }

    await page.screenshot({ path: ss('03_profile_filled') });

    // Step 7: Submit
    try {
        const submitBtn = page.locator('button').filter({ hasText: /find my scheme|submit|next|proceed|continue|find scheme/i }).first();
        await submitBtn.waitFor({ timeout: 5000 });
        await submitBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: ss('04_after_submit') });
        log('Profile', 'Submit form: Find My Scheme', 'PASS');
    } catch (e) {
        log('Profile', 'Submit form', 'FAIL', e.message);
    }

    // Read sessionStorage
    try {
        const stored = await page.evaluate(() => {
            return JSON.parse(sessionStorage.getItem('sahay_profile') || 'null');
        });
        if (stored) {
            log('Profile', 'sessionStorage sahay_profile', 'PASS', JSON.stringify(stored));
        } else {
            log('Profile', 'sessionStorage sahay_profile', 'FAIL', 'Key is null or missing');
        }
    } catch (e) {
        log('Profile', 'Read sessionStorage', 'FAIL', e.message);
    }

    // ═══════════════════════════════════════════════
    // TEST 2: Result Page Scroll & Layout
    // ═══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════');
    console.log('TEST 2: Result Page Scroll & Layout');
    console.log('══════════════════════════════════════');

    try {
        await page.goto(`${BASE_URL}/result`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        await page.screenshot({ path: ss('05_result_page') });
        log('Result', 'Navigate to /result', 'PASS');
    } catch (e) {
        log('Result', 'Navigate to /result', 'FAIL', e.message);
    }

    // Check filter chips horizontal scroll
    try {
        const filterContainer = page.locator('.pl-filters, [class*="filter"]').first();
        const box = await filterContainer.boundingBox();
        if (box) {
            // Check overflow-x property
            const overflow = await filterContainer.evaluate(el => {
                return window.getComputedStyle(el).overflowX;
            });
            const isScrollable = overflow === 'auto' || overflow === 'scroll';
            log('Result', 'Filter chips: overflow-x scrollable', isScrollable ? 'PASS' : 'FAIL', `overflow-x="${overflow}"`);

            // Check buttons don't wrap
            const buttons = filterContainer.locator('button');
            const count = await buttons.count();
            if (count > 0) {
                const firstBtn = await buttons.first().boundingBox();
                const lastBtn = await buttons.last().boundingBox();
                const sameRow = firstBtn && lastBtn && Math.abs(firstBtn.y - lastBtn.y) < 10;
                log('Result', `Filter buttons stay on one row (${count} buttons)`, sameRow ? 'PASS' : 'FAIL',
                    `first.y=${Math.round(firstBtn?.y)}, last.y=${Math.round(lastBtn?.y)}`);
            }
        } else {
            log('Result', 'Filter chips container found', 'FAIL', 'No bounding box — element may not exist');
        }
    } catch (e) {
        log('Result', 'Filter chips scroll check', 'FAIL', e.message);
    }

    // Check partner cards vertical scroll (inline style — no Bootstrap)
    try {
        // Find the scrollable cards wrapper by checking computed style of all divs
        const overflow = await page.evaluate(() => {
            const allDivs = Array.from(document.querySelectorAll('div'));
            const scrollable = allDivs.find(el => {
                const s = window.getComputedStyle(el);
                return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > 100;
            });
            return scrollable ? window.getComputedStyle(scrollable).overflowY : 'none-found';
        });
        const isScrollable = overflow === 'auto' || overflow === 'scroll';
        log('Result', 'Cards list: overflow-y scrollable (inline style)', isScrollable ? 'PASS' : 'FAIL', `overflow-y="${overflow}"`);
    } catch (e) {
        log('Result', 'Cards list vertical scroll', 'FAIL', e.message);
    }

    await page.screenshot({ path: ss('06_result_scroll_check') });

    // ═══════════════════════════════════════════════
    // TEST 3: Partners Page Map & Overlay
    // ═══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════');
    console.log('TEST 3: Partners Page Map & Overlay');
    console.log('══════════════════════════════════════');

    try {
        await page.goto(`${BASE_URL}/partners`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500); // Wait for map + resize event
        await page.screenshot({ path: ss('07_partners_page') });
        log('Partners', 'Navigate to /partners', 'PASS');
    } catch (e) {
        log('Partners', 'Navigate to /partners', 'FAIL', e.message);
    }

    // Check Leaflet tiles rendered
    try {
        const tiles = page.locator('.leaflet-tile-loaded');
        const count = await tiles.count();
        log('Partners', `Leaflet tiles loaded (${count} tiles)`, count > 0 ? 'PASS' : 'FAIL', `${count} .leaflet-tile-loaded elements`);
        await page.screenshot({ path: ss('08_map_tiles') });
    } catch (e) {
        log('Partners', 'Leaflet tile check', 'FAIL', e.message);
    }

    // Click first partner card
    try {
        const partnerCard = page.locator('.pl-card, .pl-partner-card, [class*="partner-card"], .pl-list > div').first();
        await partnerCard.waitFor({ timeout: 5000 });
        await partnerCard.click();
        await page.waitForTimeout(1200);
        await page.screenshot({ path: ss('09_partner_card_click') });
        log('Partners', 'Click first partner card', 'PASS');

        // Check overlay visible
        const overlay = page.locator('.pl-detail, [class*="detail"]').first();
        const overlayVisible = await overlay.isVisible({ timeout: 3000 }).catch(() => false);
        log('Partners', '.pl-detail overlay appears', overlayVisible ? 'PASS' : 'FAIL');

        if (overlayVisible) {
            // Check action buttons visible
            const actionBtns = overlay.locator('button, a').filter({ hasText: /direction|call|contact|apply|close/i });
            const btnCount = await actionBtns.count();
            log('Partners', `Action buttons in overlay (${btnCount} found)`, btnCount > 0 ? 'PASS' : 'FAIL');

            // Verify buttons not cut off (within overlay bounding box)
            if (btnCount > 0) {
                const overlayBox = await overlay.boundingBox();
                const lastBtn = await actionBtns.last().boundingBox();
                if (overlayBox && lastBtn) {
                    const inBounds = lastBtn.y + lastBtn.height <= overlayBox.y + overlayBox.height + 5;
                    log('Partners', 'Action buttons fully visible (not clipped)', inBounds ? 'PASS' : 'FAIL',
                        `btn bottom=${Math.round(lastBtn.y + lastBtn.height)}, overlay bottom=${Math.round(overlayBox.y + overlayBox.height)}`);
                }
            }
        }
        await page.screenshot({ path: ss('10_partner_overlay') });
    } catch (e) {
        log('Partners', 'Partner card click & overlay', 'FAIL', e.message);
    }

    // ═══════════════════════════════════════════════
    // FINAL REPORT
    // ═══════════════════════════════════════════════
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const info = results.filter(r => r.status === 'INFO').length;

    console.log('\n══════════════════════════════════════');
    console.log(`TEST SUMMARY: ${passed} PASS | ${failed} FAIL | ${info} INFO`);
    console.log('══════════════════════════════════════');

    const report = {
        timestamp: new Date().toISOString(),
        summary: { passed, failed, info, total: results.length },
        results,
        screenshotsDir: SS_DIR
    };

    writeFileSync(join(__dirname, 'test_report.json'), JSON.stringify(report, null, 2));
    console.log(`\nReport saved: ${join(__dirname, 'test_report.json')}`);
    console.log(`Screenshots saved: ${SS_DIR}`);

    await browser.close();
    return report;
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
