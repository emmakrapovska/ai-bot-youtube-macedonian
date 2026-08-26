package mk.ukim.finki.aibotbackend.service.domain.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import mk.ukim.finki.aibotbackend.model.domain.ExtractionSession;
import mk.ukim.finki.aibotbackend.model.enums.SessionStatus;
import mk.ukim.finki.aibotbackend.model.exception.InvalidSessionStateException;
import mk.ukim.finki.aibotbackend.model.exception.SessionNotFoundException;
import mk.ukim.finki.aibotbackend.repository.ExtractionSessionRepository;
import mk.ukim.finki.aibotbackend.service.domain.ExtractionSessionService;
import org.springframework.stereotype.Service;

@Service
public class ExtractionSessionServiceImpl implements ExtractionSessionService {
    private final ExtractionSessionRepository extractionSessionRepository;

    public ExtractionSessionServiceImpl(ExtractionSessionRepository extractionSessionRepository) {
        this.extractionSessionRepository = extractionSessionRepository;
    }

    @Override
    public List<ExtractionSession> findAll() {
        return extractionSessionRepository.findAll();
    }

    @Override
    public Optional<ExtractionSession> findById(Long id) {
        return extractionSessionRepository.findById(id);
    }

    @Override
    public ExtractionSession create(ExtractionSession session) {
        return extractionSessionRepository.save(session);
    }

    @Override
    public ExtractionSession start(Long id) {
        // TODO(student): Validate the current status (only CREATED or PAUSED may
        //  start), set the status to RUNNING, stamp startedAt and save.
        ExtractionSession extractionSession=extractionSessionRepository.findById(id).orElseThrow(()-> new SessionNotFoundException(id));
        if(extractionSession.getStatus() == SessionStatus.CREATED || extractionSession.getStatus()== SessionStatus.PAUSED){
            extractionSession.setStatus(SessionStatus.RUNNING);
            extractionSession.setStartedAt(LocalDateTime.now());
            extractionSessionRepository.save(extractionSession);
        }else{
            throw new InvalidSessionStateException(id,extractionSession.getStatus());
        }
        return extractionSession;
    }

    @Override
    public ExtractionSession stop(Long id) {
        ExtractionSession extractionSession=extractionSessionRepository.findById(id).orElseThrow(()-> new SessionNotFoundException(id));
        if(extractionSession.getStatus() != SessionStatus.RUNNING){
            throw new InvalidSessionStateException(id,extractionSession.getStatus());
        }
        extractionSession.setStatus(SessionStatus.PAUSED);
        return extractionSessionRepository.save(extractionSession);
    }

    @Override
    public ExtractionSession complete(Long id) {
        ExtractionSession extractionSession=extractionSessionRepository.findById(id).orElseThrow(()-> new SessionNotFoundException(id));
        if(extractionSession.getStatus() != SessionStatus.RUNNING){
            throw new InvalidSessionStateException(id,extractionSession.getStatus());
        }
        extractionSession.setStatus(SessionStatus.COMPLETED);
        extractionSession.setFinishedAt(LocalDateTime.now());
        return extractionSessionRepository.save(extractionSession);
    }

    @Override
    public ExtractionSession fail(Long id) {
        ExtractionSession extractionSession=extractionSessionRepository.findById(id).orElseThrow(()-> new SessionNotFoundException(id));
        if(extractionSession.getStatus() != SessionStatus.RUNNING){
            throw new InvalidSessionStateException(id,extractionSession.getStatus());
        }
        extractionSession.setStatus(SessionStatus.FAILED);
        extractionSession.setFinishedAt(LocalDateTime.now());
         return extractionSessionRepository.save(extractionSession);
    }
}
