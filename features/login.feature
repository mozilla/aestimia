Feature: Logging In

  Scenario: Mentor attempts to log in
    When a Mentor logs in to Aestimia
    And there are no submissions for them to review
    Then they should see the text "You have nothing to review."
