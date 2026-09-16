package mk.ukim.finki.aibotbackend.service;

import jakarta.transaction.Transactional;
import java.util.List;
import mk.ukim.finki.aibotbackend.integration.vezilka.DonationReceipt;
import mk.ukim.finki.aibotbackend.integration.vezilka.TextDonationRequest;
import mk.ukim.finki.aibotbackend.integration.vezilka.VezilkaClient;
import mk.ukim.finki.aibotbackend.model.domain.DonationBatch;
import mk.ukim.finki.aibotbackend.model.domain.ExtractedPost;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.enums.DonationStatus;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import mk.ukim.finki.aibotbackend.repository.ExtractedPostRepository;
import mk.ukim.finki.aibotbackend.repository.ExtractionSessionRepository;
import mk.ukim.finki.aibotbackend.service.domain.DonationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;


/**
 * TODO(student): Integration-test the donation workflow (createBatch ->
 * approve -> submit) with the full Spring context and a mocked/stubbed
 * VezilkaClient. Remove @Disabled once implemented.
 */
@SpringBootTest
@Testcontainers
@Transactional
public class DonationServiceIntegrationTest {
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
    private DonationService donationService;

    @Autowired
    private ExtractionSessionRepository extractionSessionRepository;

    @Autowired
    private ExtractedPostRepository extractedPostRepository;

    @MockitoBean
    private VezilkaClient vezilkaClient;

    private Long postId;

    @BeforeEach
    void setUp() {
        ExtractionSession session = new ExtractionSession(SocialNetwork.YOUTUBE, "Integration test session");
        extractionSessionRepository.save(session);

        ExtractedPost post = new ExtractedPost(
                session,
                null,
                "test-author",
                "Тест содржина на македонски јазик",
                "https://youtube.com/watch?v=test",
                null,
                0.9
        );
        extractedPostRepository.save(post);
        postId = post.getId();

        when(vezilkaClient.submitTextDonation(any(TextDonationRequest.class)))
                .thenReturn(new DonationReceipt("mock-reference-123", null));
        when(vezilkaClient.checkStatus(anyString()))
                .thenReturn(DonationStatus.ACCEPTED);
    }

    @Test
    void testDonationWorkflow() {
        DonationBatch batch = donationService.createBatch(List.of(postId));
        assertThat(batch.getStatus()).isEqualTo(DonationStatus.DRAFT);
        assertThat(batch.getPosts()).hasSize(1);

        DonationBatch approved = donationService.approve(batch.getId());
        assertThat(approved.getStatus()).isEqualTo(DonationStatus.APPROVED);

        DonationBatch submitted = donationService.submit(approved.getId());
        assertThat(submitted.getStatus()).isEqualTo(DonationStatus.SUBMITTED);
        assertThat(submitted.getVezilkaReference()).isEqualTo("mock-reference-123");
        assertThat(submitted.getSubmittedAt()).isNotNull();
    }
}
