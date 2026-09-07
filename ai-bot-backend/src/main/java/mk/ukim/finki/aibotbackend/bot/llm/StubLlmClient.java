package mk.ukim.finki.aibotbackend.bot.llm;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.model.enums.BotActionType;
import mk.ukim.finki.aibotbackend.model.exception.BotExecutionException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with an implementation backed by a real LLM.
 */
@Component
public class StubLlmClient implements LlmClient {

    private final RestClient restClient;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StubLlmClient(GeminiProperties geminiProperties) {
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader("x-goog-api-key", geminiProperties.apiKey())
                .build();
        this.model = geminiProperties.model();
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        String combinedPrompt = systemPrompt + "\n\n" + userPrompt;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", combinedPrompt)))
                )
        );

        try {
            GeminiResponse response = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(GeminiResponse.class);

            return response.candidates().get(0).content().parts().get(0).text();

        } catch (RestClientException e) {
            throw new BotExecutionException("Failed to get completion from Gemini", e);
        }
    }

    @Override
    public BotDecision decideNextAction(PageSnapshot snapshot, String goal, List<BotAction> history) {
        String prompt = buildPrompt(snapshot, goal, history);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "response_mime_type", "application/json",
                        "response_schema", buildResponseSchema()
                )
        );

        try {
            GeminiResponse response = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(GeminiResponse.class);

            String jsonText = response.candidates().get(0).content().parts().get(0).text();
            return parseDecision(jsonText);

        } catch (RestClientException e) {
            throw new BotExecutionException("Failed to get decision from Gemini", e);
        }
    }

    private String buildPrompt(PageSnapshot snapshot, String goal, List<BotAction> history) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ти си AI агент кој навигира низ YouTube за да извлече македонска содржина.\n\n");
        sb.append("ЦЕЛ: ").append(goal).append("\n\n");
        sb.append("МОМЕНТАЛНА СТРАНИЦА:\n");
        sb.append("URL: ").append(snapshot.url()).append("\n");
        sb.append("Наслов: ").append(snapshot.title()).append("\n");
        sb.append("Содржина (скратено): ").append(truncate(snapshot.domContent(), 8000)).append("\n\n");

        if (!history.isEmpty()) {
            sb.append("ВЕЌЕ ИЗВРШЕНИ АКЦИИ:\n");
            for (BotAction pastAction : history) {
                sb.append("- ").append(pastAction.type())
                        .append(" (").append(pastAction.reasoning()).append(")\n");
            }
            sb.append("\n");
        }

        sb.append("Одлучи ја следната акција. Достапни типови: ")
                .append("NAVIGATE, CLICK, TYPE, SCROLL, WAIT, EXTRACT, LOGIN, FINISH.\n");
        sb.append("Ако целта е постигната, постави goalReached=true.");

        return sb.toString();
    }

    private String truncate(String text, int maxLength) {
        if (text == null) {
            return "";
        }
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }

    private BotDecision parseDecision(String jsonText) {
        try {
            GeminiDecisionDto dto = objectMapper.readValue(jsonText, GeminiDecisionDto.class);

            BotAction action = new BotAction(
                    BotActionType.valueOf(dto.actionType()),
                    dto.target(),
                    dto.value(),
                    dto.reasoning()
            );

            return new BotDecision(action, dto.goalReached(), dto.rationale());

        } catch (Exception e) {
            throw new BotExecutionException("Failed to parse Gemini response as BotDecision", e);
        }
    }

    private Map<String, Object> buildResponseSchema() {
        return Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "actionType", Map.of("type", "STRING", "enum",
                                List.of("NAVIGATE", "CLICK", "TYPE", "SCROLL", "WAIT", "EXTRACT", "LOGIN", "FINISH")),
                        "target", Map.of("type", "STRING", "nullable", true),
                        "value", Map.of("type", "STRING", "nullable", true),
                        "reasoning", Map.of("type", "STRING"),
                        "goalReached", Map.of("type", "BOOLEAN"),
                        "rationale", Map.of("type", "STRING")
                ),
                "required", List.of("actionType", "reasoning", "goalReached", "rationale")
        );
    }

    private record GeminiDecisionDto(
            String actionType,
            String target,
            String value,
            String reasoning,
            boolean goalReached,
            String rationale
    ) {
    }

    private record GeminiResponse(List<Candidate> candidates) {
        record Candidate(Content content) {
        }
        record Content(List<Part> parts) {
        }
        record Part(String text) {
        }
    }
}

