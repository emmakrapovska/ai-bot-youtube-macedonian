package mk.ukim.finki.aibotbackend.bot.browser;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import mk.ukim.finki.aibotbackend.config.BotProperties;
import org.springframework.stereotype.Component;

import java.util.Base64;

/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with your Playwright/Selenium-backed implementation.
 */
@Component
public class StubBrowserAgent implements BrowserAgent {

    private final BotProperties botProperties;
    private Playwright playwright;
    private Browser browser;
    private Page page;

    public StubBrowserAgent(BotProperties botProperties) {
        this.botProperties = botProperties;
    }

    @Override
    public void start() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
                new BrowserType.LaunchOptions().setHeadless(botProperties.headless())
        );
        page = browser.newPage();
    }

    @Override
    public void navigateTo(String url) {
        page.navigate(url);
    }

    @Override
    public void click(String elementDescription) {
        page.locator(elementDescription).first().click();
    }

    @Override
    public void type(String elementDescription, String text) {
        page.locator(elementDescription).first().fill(text);
    }

    @Override
    public void scrollDown() {
        page.mouse().wheel(0, 800);
    }

    @Override
    public byte[] takeScreenshot() {
        return page.screenshot();
    }

    @Override
    public PageSnapshot snapshot() {
        String screenshotBase64 = Base64.getEncoder().encodeToString(page.screenshot());
        return new PageSnapshot(
                page.url(),
                page.title(),
                page.content(),
                screenshotBase64
        );
    }

    @Override
    public void close() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }
}
