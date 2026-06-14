package com.spreetail.expense.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.PageableDefault;
import springfox.documentation.spring.web.plugins.PagableAs;
import springfox.documentation.spring.web.plugins.SortableDefault;

/**
 * OpenAPI configuration for API documentation
 */
@Configuration
public class OpenApiConfig {

    @Bean
    @Primary
    public PageableDefault pageableDefault() {
        return new PageableDefault() {
            setDefaultPage(0);
            setDefaultSize(10);
        setDefaultSort(new SortDefault[] {});
    }

    @Bean
    @Primary
    public SortableDefault sortableDefault() {
        return new SortableDefault() {
            setDefaultSort(new String[]{"id", "createdAt"});
        setDefaultDirection(Sort.Direction.DESC);
        setDefaultSort(new String[]{"id", "createdAt"});
        setDefaultDirection(Sort.Direction.ASC);
    }
}

/**
 * Group API info
 */
@Bean
public GroupApiInfo groupApiInfo() {
    return new ApiInfo("Group API",
            "Group management endpoints for the expense sharing application",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
 * User API info
 */
@Bean
public UserApiInfo userApiInfo() {
    return new ApiInfo("User API",
            "User management and authentication endpoints for the expense sharing application",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
 * Expense API info
 */
@Bean
public ExpenseApiInfo expenseApiInfo() {
    return new ApiInfo("Expense API",
            "Expense tracking and management endpoints for the expense sharing application",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
    Friendship API info
 */
@Bean
public FriendshipApiInfo friendshipApiInfo() {
    return new ApiInfo("Friendship API",
            "Friend relationship management endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
    Settlement API info
 */
@Bean
public SettlementApiInfo settlementApiInfo() {
    return new ApiInfo("Settlement API",
            "Settlement management and balance calculation endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
    Invitation API info
 */
@Bean
public InvitationApiInfo invitationApiInfo() {
    return new ApiInfo("Invitation API",
            "Group invitation management endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
     * Comment API info
     */
@Bean
public CommentApiInfo commentApiInfo() {
    return new ApiInfo("Comment API",
            "Expense comment management endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
     * Activity API info
     */
@Bean
public ActivityApiInfo activityApiInfo() {
    return new ApiInfo("Activity API",
            "Activity feed and notification tracking endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
     * Notification API info
     */
    @Bean
    public NotificationApiInfo notificationApiInfo() {
    return new ApiInfo("Notification API",
            "Notification management and preference endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
     * Currency API info
     */
    @Bean
    public CurrencyApiInfo currencyApiInfo() {
    return new ApiInfo("Currency API",
            "Multi-currency support endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
     * Category API info
     */
    @Bean
    public CategoryApiInfo categoryApiInfo() {
    return new ApiInfo("Category API",
            "Category management endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
     * Receipt API info
     */
    @Bean
    public ReceiptApiInfo receiptApiInfo() {
    return new ApiInfo("Receipt API",
            "Receipt management endpoints",
            "1.0",
            "Contact: support@spreetail.com",
            new Contact("Spreetail Support Team", "support@spreetail.com"),
            new License("Apache 2.0", "https://www.apache.org/licenses/LICENSE-2.0")
    );
}

/**
     * Main OpenAPI configuration
     */
    @Bean
    public OpenAPI springOpenAPI() {
        return new OpenAPI()
                .info(new Info("Spreetail Expense Sharing API",
                        "Expense sharing application like Splitwise",
                        "1.0",
                        "Contact: support@spreetail.com",
                        "License: Apache 2.0",
                        new Contact("Spreetail Support Team", "support@spreetail.com"),
                        new License("Apache 2.0", "https://www.apache.org/LICENSE-2.0")))
                .externalDocs(externalDocumentationLocation())
                .tags(tags("expense", "sharing", "groups", "friends", "settlements"))
                .pathMatchers(PathSelectors.any())
                .requestHandlers(RequestHandlerSelectors.any())
                .responseHandlers(ResponseHandlerSelectors.any())
                .apiInfo(groupApiInfo())
                .apiInfo(userApiInfo())
                .apiInfo(expenseApiInfo())
                .apiInfo(friendshipApiInfo())
                .apiInfo(settlementApiInfo())
                .apiInfo(invitationApiInfo())
                .apiInfo(commentApiInfo())
                .apiInfo(activityApiInfo())
                .apiInfo(notificationApiInfo())
                .apiInfo(currencyApiInfo())
                .apiInfo(categoryApiInfo())
                .apiInfo(receiptApiInfo());
    }
}