package com.kuraflow.progress.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Value("${app.kafka.topics.lesson-completed}")
    private String lessonCompletedTopic;

    @Value("${app.kafka.topics.review-completed}")
    private String reviewCompletedTopic;

    @Bean
    public NewTopic lessonCompletedTopic() {
        return TopicBuilder.name(lessonCompletedTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic reviewCompletedTopic() {
        return TopicBuilder.name(reviewCompletedTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
