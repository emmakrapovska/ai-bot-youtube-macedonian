package mk.ukim.finki.aibotbackend.bot.core;

import mk.ukim.finki.aibotbackend.bot.browser.BrowserAgent;
import mk.ukim.finki.aibotbackend.bot.extraction.ContentExtractor;
import mk.ukim.finki.aibotbackend.bot.extraction.LanguageDetector;
import mk.ukim.finki.aibotbackend.bot.llm.LlmClient;
import mk.ukim.finki.aibotbackend.config.BotProperties;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionTarget;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class YoutubeBot extends AbstractSocialNetworkBot {

    private static final Logger log = LoggerFactory.getLogger(YoutubeBot.class);

    public YoutubeBot(
            BrowserAgent browserAgent,
            LlmClient llmClient,
            ContentExtractor contentExtractor,
            LanguageDetector languageDetector,
            BotProperties botProperties
    ) {
        super(browserAgent, llmClient, contentExtractor, languageDetector, botProperties);
    }

    @Override
    public SocialNetwork network() {
        return SocialNetwork.YOUTUBE;
    }

    @Override
    public void login() {
        log.info("YouTube extraction targets only public content — no login required.");
    }

    @Override
    protected String buildGoal(ExtractionTarget target) {
        return switch (target.getType()) {
            case PROFILE -> "Отвори го YouTube каналот '" + target.getValue()
                    + "', отвори едно од неговите неодамнешни видеа, отвори ја секцијата со коментари "
                    + "(скролувај доколку е потребно за да се вчитаат) и извлечи ги коментарите.";

            case KEYWORD -> "Пребарај на YouTube за '" + target.getValue()
                    + "', отвори едно од релевантните видеа, отвори ја секцијата со коментари "
                    + "(скролувај доколку е потребно) и извлечи ги коментарите.";

            case HASHTAG -> "Пребарај на YouTube за хештаг '" + target.getValue()
                    + "', отвори едно од релевантните видеа, отвори ја секцијата со коментари "
                    + "(скролувај доколку е потребно) и извлечи ги коментарите.";

            case FEED_URL -> "Отвори го видеото на адреса '" + target.getValue()
                    + "', отвори ја секцијата со коментари (скролувај доколку е потребно) "
                    + "и извлечи ги коментарите.";
        };
    }
}