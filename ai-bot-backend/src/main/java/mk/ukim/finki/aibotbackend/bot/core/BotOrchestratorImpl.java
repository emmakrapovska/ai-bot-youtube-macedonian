package mk.ukim.finki.aibotbackend.bot.core;

import org.springframework.transaction.annotation.Transactional;
import mk.ukim.finki.aibotbackend.model.domain.ExtractedPost;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionTarget;
import mk.ukim.finki.aibotbackend.model.dto.CreateExtractedPostDto;
import mk.ukim.finki.aibotbackend.model.exception.SessionNotFoundException;
import mk.ukim.finki.aibotbackend.service.domain.BotActionLogService;
import mk.ukim.finki.aibotbackend.service.domain.ExtractedPostService;
import mk.ukim.finki.aibotbackend.service.domain.ExtractionSessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BotOrchestratorImpl implements BotOrchestrator {
    private final SocialNetworkBot socialNetworkBot;
    private final ExtractionSessionService extractionSessionService;
    private final ExtractedPostService extractedPostService;
    private final BotActionLogService botActionLogService;
    private static final Logger log = LoggerFactory.getLogger(BotOrchestratorImpl.class);

    public BotOrchestratorImpl(
            SocialNetworkBot socialNetworkBot,
            ExtractionSessionService extractionSessionService,
            ExtractedPostService extractedPostService,
            BotActionLogService botActionLogService
    ) {
        this.socialNetworkBot = socialNetworkBot;
        this.extractionSessionService = extractionSessionService;
        this.extractedPostService = extractedPostService;
        this.botActionLogService = botActionLogService;
    }

    @Transactional
    @Override
    public void runSession(Long sessionId) {
        ExtractionSession session = extractionSessionService
                .findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        // TODO(student): Orchestrate the full run:
        //  1. socialNetworkBot.login()
        //  2. for each target of the session:
        //       socialNetworkBot.execute(target,
        //           (action, successful) -> botActionLogService.log(session, action, successful))
        //     then map the returned DTOs with CreateExtractedPostDto.toExtractedPost(session)
        //     and persist them with extractedPostService.saveAll(...)
        //  3. mark the session COMPLETED via extractionSessionService.complete(sessionId),
        //     or FAILED via extractionSessionService.fail(sessionId) when something goes wrong
        //  4. always socialNetworkBot.shutdown() at the end

        try {
            socialNetworkBot.login();

            for (ExtractionTarget target : session.getTargets()) {
                List<CreateExtractedPostDto> extractedPosts = socialNetworkBot.execute(
                        target,
                        (action, successful) -> botActionLogService.log(session, action, successful)
                );
                List<ExtractedPost> posts = extractedPosts.stream()
                        .map(dto -> dto.toExtractedPost(session))
                        .toList();

                extractedPostService.saveAll(posts);
            }
            extractionSessionService.complete(sessionId);

        } catch (Exception e) {
            log.error("Session {} failed", sessionId, e);
            extractionSessionService.fail(sessionId);
        } finally {
            socialNetworkBot.shutdown();
        }
    }
}
