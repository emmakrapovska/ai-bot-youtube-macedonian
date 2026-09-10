import { useCallback, useEffect, useState } from 'react';
import donationApi from '../api/donationApi.ts';
import type { CreateDonationBatchRequest, DonationBatchResponse } from '../api/types/donation.ts';

/**
 * TODO(student): Drive the donation workflow for the DonationsPage: list the
 * batches (donationApi.findAll) and expose create/approve/submit actions,
 * re-fetching after every mutation, with loading/error state.
 */
const useDonations = () => {
  const [donations, setDonations] = useState<DonationBatchResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await donationApi.findAll();
      setDonations(response.data);
    } catch (err) {
      console.error('Failed to load donations.', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDonations();
  }, [fetchDonations]);

  const onCreate = async (data: CreateDonationBatchRequest) => {
    try {
      await donationApi.add(data);
      await fetchDonations();
    } catch (err) {
      console.error('Failed to create donation batch.', err);
    }
  };

  const onApprove = async (id: number) => {
    try {
      await donationApi.approve(id.toString());
      await fetchDonations();
    } catch (err) {
      console.error('Failed to approve donation batch.', err);
    }
  };

  const onSubmit = async (id: number) => {
    try {
      await donationApi.submit(id.toString());
      await fetchDonations();
    } catch (err) {
      console.error('Failed to submit donation batch.', err);
    }
  };

  return { donations, loading, onCreate, onApprove, onSubmit };
};

export default useDonations;
