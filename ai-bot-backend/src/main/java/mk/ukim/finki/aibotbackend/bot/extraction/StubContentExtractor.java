package mk.ukim.finki.aibotbackend.bot.extraction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import mk.ukim.finki.aibotbackend.bot.browser.PageSnapshot;
import mk.ukim.finki.aibotbackend.model.dto.CreateExtractedPostDto;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with an extractor for your assigned social network.
 */
@Component
public class StubContentExtractor implements ContentExtractor {
    @Override
    public List<CreateExtractedPostDto> extract(PageSnapshot snapshot) {
        List<CreateExtractedPostDto> posts = new ArrayList<>();

        if (snapshot.domContent() == null || snapshot.domContent().isBlank()) {
            return posts;
        }

        Document document = Jsoup.parse(snapshot.domContent());
        Elements commentThreads = document.select("ytd-comment-thread-renderer");

        for (Element thread : commentThreads) {
            String author = extractText(thread, "#author-text");
            String content = extractText(thread, "#content-text");

            if (content == null || content.isBlank()) {
                continue;
            }

            posts.add(new CreateExtractedPostDto(
                    null,
                    author,
                    content,
                    snapshot.url(),
                    LocalDateTime.now(),
                    null,
                    List.of()
            ));
        }

        return posts;
    }

    private String extractText(Element parent, String cssSelector) {
        Element element = parent.selectFirst(cssSelector);
        return element != null ? element.text().trim() : null;
    }
}
