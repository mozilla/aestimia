Feature: Logging In

  Scenario: Mentor logs in with nothing to review
    When a Mentor logs in to Aestimia
    And there are no submissions for them to review
    Then they should see the text "You have nothing to review."

  Scenario: Mentor logs in with something to review
    When a Mentor logs in to Aestimia
    And there is a submission for them to review
    Then they should see the text "Awaiting Review"
