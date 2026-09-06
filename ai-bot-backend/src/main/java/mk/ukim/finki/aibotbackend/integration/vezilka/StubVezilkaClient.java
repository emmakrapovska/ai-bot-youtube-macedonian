package mk.ukim.finki.aibotbackend.integration.vezilka;

import mk.ukim.finki.aibotbackend.model.enums.DonationStatus;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import mk.ukim.finki.aibotbackend.model.exception.VezilkaIntegrationException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with a real doniraj.vezilka.ai client.
 */
@Component
public class StubVezilkaClient implements VezilkaClient {

    private final RestClient restClient;

    public StubVezilkaClient(VezilkaProperties vezilkaProperties) {
        this.restClient = RestClient.builder()
                .baseUrl(vezilkaProperties.baseUrl())
                .defaultHeader("X-Donation-Api-Key", vezilkaProperties.apiKey())
                .build();
    }

    @Override
    public DonationReceipt submitTextDonation(TextDonationRequest request) {
        try {
            Map<String, Object> item = Map.of(
                    "source_url", request.sourceUrl(),
                    "text", request.content(),
                    "page_title", request.title(),
                    "retrieved_at", Instant.now().toString()
            );

            Map<String, Object> body = Map.of("items", List.of(item));

            SubmitResponse response = restClient.post()
                    .uri("/api/public/v1/donations/text/")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(SubmitResponse.class);

            if (response == null || response.results() == null || response.results().isEmpty()) {
                throw new VezilkaIntegrationException("Empty response from Vezilka");
            }

            DonationResult result = response.results().get(0);

            String message = result.deduped() != null && result.deduped()
                    ? "Duplicate content, already in corpus"
                    : result.rejectionReason();

            return new DonationReceipt(result.id(), message);

        } catch (RestClientException e) {
            throw new VezilkaIntegrationException("Failed to submit donation to Vezilka", e);
        }
    }

    @Override
    public DonationStatus checkStatus(String vezilkaReference) {
        try {
            DonationResult result = restClient.get()
                    .uri("/api/public/v1/donations/{id}/", vezilkaReference)
                    .retrieve()
                    .body(DonationResult.class);

            if (result == null || result.status() == null) {
                throw new VezilkaIntegrationException("Empty status response from Vezilka");
            }

            return switch (result.status()) {
                case "accepted" -> DonationStatus.ACCEPTED;
                case "rejected" -> DonationStatus.REJECTED;
                default -> DonationStatus.SUBMITTED;
            };

        } catch (RestClientException e) {
            throw new VezilkaIntegrationException("Failed to check donation status on Vezilka", e);
        }
    }

    private record SubmitResponse(
            List<DonationResult> results,
            Integer total,
            Integer accepted,
            Integer rejected,
            Integer duplicates
    ) {
    }

    private record DonationResult(
            String id,
            String status,
            String contentType,
            Boolean deduped,
            Integer awardedPoints,
            String rejectionReason
    ) {
    }
}