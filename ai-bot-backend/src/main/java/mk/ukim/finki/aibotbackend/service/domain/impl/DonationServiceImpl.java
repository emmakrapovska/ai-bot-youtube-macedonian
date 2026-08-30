package mk.ukim.finki.aibotbackend.service.domain.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import mk.ukim.finki.aibotbackend.integration.vezilka.DonationReceipt;
import mk.ukim.finki.aibotbackend.integration.vezilka.TextDonationRequest;
import mk.ukim.finki.aibotbackend.integration.vezilka.VezilkaClient;
import mk.ukim.finki.aibotbackend.model.domain.DonationBatch;
import mk.ukim.finki.aibotbackend.model.domain.ExtractedPost;
import mk.ukim.finki.aibotbackend.model.enums.DonationStatus;
import mk.ukim.finki.aibotbackend.model.exception.DonationBatchNotFoundException;
import mk.ukim.finki.aibotbackend.model.exception.InvalidDonationStateException;
import mk.ukim.finki.aibotbackend.repository.DonationBatchRepository;
import mk.ukim.finki.aibotbackend.repository.ExtractedPostRepository;
import mk.ukim.finki.aibotbackend.service.domain.DonationService;
import mk.ukim.finki.aibotbackend.service.domain.ExtractedPostService;
import org.springframework.stereotype.Service;

@Service
public class DonationServiceImpl implements DonationService {
    private final DonationBatchRepository donationBatchRepository;
    private final ExtractedPostService extractedPostService;
    private final VezilkaClient vezilkaClient;
    private final ExtractedPostRepository extractedPostRepository;

    public DonationServiceImpl(
        DonationBatchRepository donationBatchRepository,
        ExtractedPostService extractedPostService,
        VezilkaClient vezilkaClient,
        ExtractedPostRepository extractedPostRepository) {
        this.donationBatchRepository = donationBatchRepository;
        this.extractedPostService = extractedPostService;
        this.vezilkaClient = vezilkaClient;
        this.extractedPostRepository = extractedPostRepository;
    }

    @Override
    public List<DonationBatch> findAll() {
        return donationBatchRepository.findAll();
    }

    @Override
    public Optional<DonationBatch> findById(Long id) {
        return donationBatchRepository.findById(id);
    }

    @Override
    public DonationBatch createBatch(List<Long> postIds) {
        // TODO(student): Load the posts (extractedPostService.findAllById), create a
        //  DRAFT batch, attach the posts to it and save everything.
        List<ExtractedPost> extractedPosts=extractedPostService.findAllById(postIds);
        DonationBatch donationBatch=new DonationBatch(DonationStatus.DRAFT);
        donationBatchRepository.save(donationBatch);
        for(ExtractedPost extractedPost:extractedPosts){
            extractedPost.setDonationBatch(donationBatch);
        }
        extractedPostService.saveAll(extractedPosts);
        donationBatch.setPosts(extractedPosts);
        return donationBatch;
    }

    @Override
    public DonationBatch approve(Long id) {
        DonationBatch donationBatch=donationBatchRepository.findById(id)
                .orElseThrow(()->new DonationBatchNotFoundException(id));
        if(donationBatch.getStatus() != DonationStatus.DRAFT){
            throw new InvalidDonationStateException(id, donationBatch.getStatus());
        }
        donationBatch.setStatus(DonationStatus.APPROVED);
        return donationBatchRepository.save(donationBatch);
    }

    @Override
    public DonationBatch submit(Long id) {
        // TODO(student): Build a TextDonationRequest from the batch content, call
        //  vezilkaClient.submitTextDonation, store the receipt reference, stamp
        //  submittedAt, set the status to SUBMITTED and save. Consider publishing
        //  a DonationBatchSubmittedEvent afterwards.
        DonationBatch donationBatch=donationBatchRepository.findById(id)
                .orElseThrow(()->new DonationBatchNotFoundException(id));
        if (donationBatch.getStatus() != DonationStatus.APPROVED) {
            throw new InvalidDonationStateException(id, donationBatch.getStatus());
        }

        String socialNetwork = donationBatch.getPosts().isEmpty()
                ? "Unknown"
                : donationBatch.getPosts().getFirst().getSession().getSocialNetwork().name();

        String title = "Macedonian posts from " + socialNetwork + ", "
                + LocalDate.now().getMonth() + " " + LocalDate.now().getYear();

        String content = donationBatch.getPosts().stream()
                .map(post -> post.getContent() + "\n(Source: " + post.getSourceUrl() + ")")
                .collect(Collectors.joining("\n\n---\n\n"));

        String sourceUrl = "Batch #" + donationBatch.getId();

        TextDonationRequest request = new TextDonationRequest(title, content, sourceUrl);

        DonationReceipt receipt = vezilkaClient.submitTextDonation(request);

        donationBatch.setVezilkaReference(receipt.reference());
        donationBatch.setSubmittedAt(LocalDateTime.now());
        donationBatch.setStatus(DonationStatus.SUBMITTED);

        return donationBatchRepository.save(donationBatch);
    }

    @Override
    public void refreshSubmittedStatuses() {
        // TODO(student): For every batch in status SUBMITTED, call
        //  vezilkaClient.checkStatus(batch.getVezilkaReference()) and update the status.
        List<DonationBatch> batches=donationBatchRepository.findAllByStatus(DonationStatus.SUBMITTED);
        for(DonationBatch donationBatch:batches){
            DonationStatus status=vezilkaClient.checkStatus(donationBatch.getVezilkaReference());
            donationBatch.setStatus(status);
            donationBatchRepository.save(donationBatch);
        }
    }
}
