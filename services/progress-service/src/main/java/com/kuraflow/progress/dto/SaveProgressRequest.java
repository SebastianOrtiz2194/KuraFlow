package com.kuraflow.progress.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaveProgressRequest {

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be less than 0")
    @Max(value = 100, message = "Score cannot be greater than 100")
    private BigDecimal score;

    @NotNull(message = "XP earned is required")
    @Min(value = 0, message = "XP earned cannot be negative")
    private Integer xpEarned;
}
