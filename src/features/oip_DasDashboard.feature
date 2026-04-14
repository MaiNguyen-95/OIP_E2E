Feature: Dashboard Page
    Background: Show dashboard page
        Given user is on dashboard
        When I fill input "email" with "mai.nguyen@yara.com"
        And I click button "Send login link"
        And I wait for magic link and navigate
        And user should be on dashboard
        And I click button to select tenant

    @Login
    Scenario: Login and select tenant
        And I selects tenant "<tenant>"
        Examples:
            | tenant    |
            | Indonesia |

    @OverallAvailability
    Scenario: Select overall availability filter
        And I selects tenant "<tenant>"
        And I select "<area>" filter project "<project>"

        Examples:
            | tenant    | area                         | project       |
            | Indonesia | overall-availability-section | Yara Farmcare |

    @Latency
    Scenario: Select latency filter
        And I selects tenant "<tenant>"
        And I select "<area>" filter project "<project>"
        And I select latency time "<latencyTime>"
        And I click view all services
        And I click close view all services

        Examples:
            | tenant    | area            | project      | latencyTime |
            | Indonesia | latency-section | Yara Connect | 30d         |

    @ModuleFilter
    Scenario: Select time range and module filters
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I click status modules if they have value

        Examples:
            | tenant    | lastResult |
            | Indonesia | 7d         |