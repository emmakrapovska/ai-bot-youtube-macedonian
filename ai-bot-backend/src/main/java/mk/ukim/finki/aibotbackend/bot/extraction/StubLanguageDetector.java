package mk.ukim.finki.aibotbackend.bot.extraction;

import org.springframework.stereotype.Component;

/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with a real language detector.
 */
@Component
public class StubLanguageDetector implements LanguageDetector {

    private static final String MACEDONIAN_SPECIFIC_LETTERS = "ѓќѕџљњ";

    @Override
    public double macedonianConfidence(String text) {
        if (text == null || text.isBlank()) {
            return 0.0;
        }

        String lowerText = text.toLowerCase();

        long totalLetters = lowerText.chars()
                .filter(Character::isLetter)
                .count();

        if (totalLetters == 0) {
            return 0.0;
        }

        long cyrillicLetters = lowerText.chars()
                .filter(c -> Character.UnicodeScript.of(c) == Character.UnicodeScript.CYRILLIC)
                .count();

        double cyrillicRatio = (double) cyrillicLetters / totalLetters;

        long specificLetterCount = lowerText.chars()
                .filter(c -> MACEDONIAN_SPECIFIC_LETTERS.indexOf(c) >= 0)
                .count();

        double specificLetterBoost = Math.min(specificLetterCount * 0.1, 0.3);

        double confidence = cyrillicRatio * 0.7 + specificLetterBoost;

        return Math.min(confidence, 1.0);
    }
}
