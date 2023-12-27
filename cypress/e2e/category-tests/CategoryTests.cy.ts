describe("Category Tests", () => {
    beforeEach(() => {
        cy.visit("https://demo.nopcommerce.com/")
    })

    it("Check if categories have a correct title and url", () => {
        cy.get("ul[class$='notmobile'] > li > a").as("menuItems")
        cy.get("@menuItems").then(($list) => {
            let size = $list.length;
            for (let i = 0; i < size; i++) {
                let menuItemText = $list[i].textContent.trim().toLowerCase();
                cy.get("@menuItems").eq(i).click()
                cy.get('h1').then(($title) => {
                    let titleText = $title.text().trim().toLowerCase();
                    expect(menuItemText).to.eq(titleText);
                })
                cy.url().should("include", menuItemText.replace(" ", "-"))
            }
        })
    })

    it.only("Check if sub-categories have a correct title and url", () => {
        cy.get("ul[class$='notmobile'] > li > ul").as("menuItemsWithSubItems")
        cy.get("@menuItemsWithSubItems").then(($menuItemsWithSubItems) => {
            let size = $menuItemsWithSubItems.length;
            for (let i = 0; i < size; i++) {
                cy.get("@menuItemsWithSubItems").eq(i).realHover()
                cy.get("ul[class$='notmobile'] > li > ul").eq(i).find("li a")
                    .as("subMenuItems")
                cy.get("@subMenuItems").then(($subMenuList) => {
                    let subMenuSize = $subMenuList.length;
                    const subMenuTextContent = [];
                    cy.log($subMenuList.text())
                    $subMenuList.each(function (index, item) {
                        subMenuTextContent.push(Cypress.$(item).text().toLowerCase().trim())
                    })
                    for (let index = 0; index < subMenuSize; index++) {
                        cy.get("@menuItemsWithSubItems").parent().eq(i).realHover()
                        cy.get("@subMenuItems").eq(index).click()

                        verifyTitleAndUrl(subMenuTextContent[index])
                        cy.get("@menuItemsWithSubItems").parent().eq(i).realHover()
                    }
                })
            }
        })

        function verifyTitleAndUrl(expectedText: string) {
            cy.get('h1').then(($title) => {
                let titleText = $title.text().trim().toLowerCase()
                expect(expectedText).to.eq(titleText)
            })
            cy.url().should("include", formatMenuText(expectedText))
        }

        function formatMenuText(text: string) {
            return text
                .toLowerCase()
                .replace(/[&:]/g, ' ') // Replace & and : with space
                .trim() // Remove leading and trailing spaces
                .replace(/\s+/g, '-'); // Replace all spaces with hyphens
        }
    })
})

