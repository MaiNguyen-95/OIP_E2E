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

    @ExpandCollapseProject
    Scenario Outline: Expand and collapse project on dashboard
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I expand project "<project>"
        And I collapse project "<project>"

        Examples:
            | tenant    | lastResult | project      |
            | Indonesia | 24h        | Yara Connect |

    @ExpandCollapseModule
    Scenario Outline: Expand and collapse module on dashboard
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I expand project "<project>"
        And I expand module "<module>"
        And I collapse module "<module>"
        And I collapse project "<project>"

        Examples:
            | tenant    | lastResult | project       | module                    |
            | Indonesia | 24h        | Yara Farmcare | YFC - Identity Management |
    @ClickModule
    Scenario Outline: Click module on dashboard
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I expand project "<project>"
        And I click module "<module>"

        Examples:
            | tenant    | lastResult | project      | module                   |
            | Indonesia | 7d         | Yara Connect | YC - Identity Management |
            | Indonesia | 7d         | Yara Connect | YC - Home Screen         |

    @ClickSubModule
    Scenario Outline: Expand module and click submodule on dashboard
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I expand project "<project>"
        And I click submodule "<subModule>" in module "<module>"

        Examples:
            | tenant    | lastResult | project      | module                   | subModule |
            | Indonesia | 7d         | Yara Connect | YC - Identity Management | Identity  |


    @ClickBarChart
    Scenario Outline: Click bar chart of module or submodule
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I expand project "<project>"
        And I expand module "<module>"
        And I click bar chart <barIndex> of module "<module>"
        And I click bar chart <barIndex> of submodule "<subModule>" in module "<module>"

        Examples:
            | tenant    | lastResult | project      | module                   | subModule | barIndex |
            | Indonesia | 7d         | Yara Connect | YC - Identity Management | Signup    | 0        |

    @ClickFilterboxModule
    Scenario Outline: Click filter box of module
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I expand project "<project>"
        And I click "<statType>" filter box of module "<module>"

        Examples:
            | tenant    | lastResult | project      | module                   | statType |
            | Indonesia | 7d         | Yara Connect | YC - Identity Management | passing  |

    @ClickFilterboxSubModule
    Scenario Outline: Click filter box of submodule
        And I selects tenant "<tenant>"
        And I select last result "<lastResult>"
        And I expand project "<project>"
        And I expand module "<module>"
        And I click "<statType>" filter box of submodule "<subModule>" in module "<module>"

        Examples:
            | tenant    | lastResult | project      | module                   | subModule | statType |
            | Indonesia | 7d         | Yara Connect | YC - Identity Management | Signup    | passing  |