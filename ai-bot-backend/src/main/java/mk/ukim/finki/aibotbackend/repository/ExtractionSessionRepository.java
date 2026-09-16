package mk.ukim.finki.aibotbackend.repository;

import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.enums.SessionStatus;
import mk.ukim.finki.aibotbackend.model.enums.SocialNetwork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtractionSessionRepository extends JpaRepository<ExtractionSession, Long> {
    // TODO(student): Add the derived or custom queries your services need
    //  (e.g. find sessions by status, by social network, ...).

    List<ExtractionSession> findBySocialNetwork(SocialNetwork socialNetwork);

    List<ExtractionSession> findByStatus(SessionStatus status);
}
