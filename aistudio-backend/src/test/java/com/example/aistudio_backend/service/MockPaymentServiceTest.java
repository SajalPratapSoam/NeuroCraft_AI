package com.example.aistudio_backend.service;

import com.example.aistudio_backend.entity.Transaction;
import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.repository.TransactionRepository;
import com.example.aistudio_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MockPaymentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private MockPaymentService mockPaymentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(mockPaymentService, "userRepository", userRepository);
        ReflectionTestUtils.setField(mockPaymentService, "transactionRepository", transactionRepository);
    }

    @Test
    void shouldRejectSecondFreePlanPurchaseForSameUser() {
        User user = new User();
        user.setEmail("tester@example.com");
        user.setCredits(10);
        user.setCurrentPlan("FREE");
        user.setFreePlanUsed(false);

        when(userRepository.findByEmail("tester@example.com")).thenReturn(user);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockPaymentService.processMockPayment("STARTER", "tester@example.com");

        assertThrows(IllegalArgumentException.class,
                () -> mockPaymentService.processMockPayment("STARTER", "tester@example.com"));
    }
}
