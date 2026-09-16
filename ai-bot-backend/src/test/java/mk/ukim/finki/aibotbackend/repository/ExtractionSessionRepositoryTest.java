package mk.ukim.finki.aibotbackend.repository;

import jakarta.transaction.Transactional;
import java.util.List;
import mk.ukim.finki.aibotbackend.config.JpaConfig;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionTarget;
import mk.ukim.finki.aibotbackend.model.enums.SessionStatus;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import mk.ukim.finki.aibotbackend.model.enums.TargetType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * TODO(student): Test your session queries here, following the pattern from
 * {@link UserRepositoryTest}. Remove @Disabled once implemented.
 */
@DataJpaTest
@Import(JpaConfig.class)
@Transactional
@Testcontainers
public class ExtractionSessionRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("aibot_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ExtractionSessionRepository extractionSessionRepository;

    private ExtractionSession youtubeSession;

    @BeforeEach
    void setUp() {
        youtubeSession = new ExtractionSession(SocialNetwork.YOUTUBE, "Test YouTube session");
        extractionSessionRepository.save(youtubeSession);

        ExtractionSession redditSession = new ExtractionSession(SocialNetwork.REDDIT, "Test Reddit session");
        extractionSessionRepository.save(redditSession);
    }

    @Test
    void testFindBySocialNetwork() {
        List<ExtractionSession> result = extractionSessionRepository.findBySocialNetwork(SocialNetwork.YOUTUBE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDescription()).isEqualTo("Test YouTube session");
    }

    @Test
    void testFindByStatus() {
        List<ExtractionSession> created = extractionSessionRepository.findByStatus(SessionStatus.CREATED);

        assertThat(created).hasSize(2);
    }

    @Test
    void testSaveWithTargetsCascade() {
        ExtractionSession session = new ExtractionSession(SocialNetwork.YOUTUBE, "Session with targets");
        ExtractionTarget target = new ExtractionTarget(TargetType.FEED_URL, "https://youtube.com/watch?v=abc", session);
        session.getTargets().add(target);

        ExtractionSession saved = extractionSessionRepository.save(session);

        assertThat(saved.getId()).isNotNull();
    }
}
