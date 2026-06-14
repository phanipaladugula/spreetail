package com.spreetail.expense.controller;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.service.GroupService;
import com.spreetail.expense.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Tests for GroupController
 */
@ExtendWith(MockitoExtension.class)
class GroupControllerTest {

    @InjectMocks
    private GroupController groupController;

    @Mock
    private GroupService groupService;

    @Mock
    private UserService userService;

    private CreateGroupRequest createGroupRequest;
    private AddMemberRequest addMemberRequest;
    private GroupResponse groupResponse;

    @BeforeEach
    void setUp() {
        createGroupRequest = new CreateGroupRequest();
        createGroupRequest.setName("Test Group");
        createGroupRequest.setDescription("Test Description");
        createGroupRequest.setMemberIds(Arrays.asList(1L, 2L));

        addMemberRequest = new AddMemberRequest();
        addMemberRequest.setUserId(3L);

        groupResponse = new GroupResponse();
        groupResponse.setId(1L);
        groupResponse.setName("Test Group");
    }

    @Test
    void testCreateGroupReturns201() {
        // Arrange
        when(userService.getUserEmailFromToken(anyString())).thenReturn("test@example.com");
        when(userService.getUserByEmail(anyString())).thenReturn(new UserResponse(1L, "test", "test@example.com", "2024-01-01"));
        when(groupService.createGroup(any(CreateGroupRequest.class), anyLong())).thenReturn(groupResponse);

        // Act
        ResponseEntity<?> response = groupController.createGroup(createGroupRequest, "Bearer token");

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testGetGroupByIdReturns200() {
        // Arrange
        when(groupService.getGroupById(1L)).thenReturn(groupResponse);

        // Act
        ResponseEntity<?> response = groupController.getGroupById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testGetGroupByIdNotFoundReturns404() {
        // Arrange
        when(groupService.getGroupById(999L)).thenThrow(new RuntimeException("Group not found"));

        // Act
        ResponseEntity<?> response = groupController.getGroupById(999L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetMyGroupsReturnsList() {
        // Arrange
        when(userService.getUserEmailFromToken(anyString())).thenReturn("test@example.com");
        when(userService.getUserByEmail(anyString())).thenReturn(new UserResponse(1L, "test", "test@example.com", "2024-01-01"));
        when(groupService.getUserGroups(1L)).thenReturn(Arrays.asList(groupResponse));

        // Act
        ResponseEntity<?> response = groupController.getMyGroups("Bearer token");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testAddMemberReturns200() {
        // Arrange
        when(userService.getUserEmailFromToken(anyString())).thenReturn("test@example.com");
        when(groupService.addMember(anyLong(), anyLong())).thenReturn(groupResponse);

        // Act
        ResponseEntity<?> response = groupController.addMember(1L, addMemberRequest, "Bearer token");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testRemoveMemberReturns200() {
        // Arrange
        when(groupService.removeMember(anyLong(), anyLong())).thenReturn(groupResponse);

        // Act
        ResponseEntity<?> response = groupController.removeMember(1L, 2L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testUpdateGroupReturns200() {
        // Arrange
        var updateRequest = new UpdateGroupRequest();
        updateRequest.setName("Updated Name");

        when(groupService.updateGroup(anyLong(), any(UpdateGroupRequest.class))).thenReturn(groupResponse);

        // Act
        ResponseEntity<?> response = groupController.updateGroup(1L, updateRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testDeleteGroupReturns200() {
        // Arrange
        when(groupService.deleteGroup(anyLong())).thenReturn("Group deleted successfully");

        // Act
        ResponseEntity<?> response = groupController.deleteGroup(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testAddMemberByEmailReturns200() {
        // Arrange
        when(groupService.addMemberByEmail(anyLong(), anyString())).thenReturn(groupResponse);

        // Act
        ResponseEntity<?> response = groupController.addMemberByEmail(1L, "newuser@example.com", "Bearer token");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}