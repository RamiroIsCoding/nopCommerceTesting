describe("Category Tests", () => {
  beforeEach(() => {
    cy.visit("https://demo.nopcommerce.com/")
  })

  it("Check if categories have a correct title and url", () => {
    cy.get("ul[class$='notmobile'] > li > a")
      .as("categoriesList")
      .each(($elem, index: number) => {
        const categoryText: string = $elem.text().trim().toLowerCase();
        cy.get("@categoriesList").eq(index).click();
        cy.get(".page-title h1")
          .invoke("text")
          .then((titleText) => {
            expect(categoryText).to.eq(titleText.trim().toLowerCase());
            cy.url().should("contain", categoryText.replace(" ", "-"));
          })
      })
  })

  it("Check if sub-categories have a correct title and url", () => {
    cy.get("ul[class$='notmobile'] > li > ul")
      .as("menuItemsWithSubItems")
      .each((_, menuIndex) => {
        cy.get("ul[class$='notmobile'] > li > ul")
          .eq(menuIndex)
          .find("li a")
          .as("subMenuItems")
          .each(($subMenuItem, subMenuIndex) => {
            cy.get("@menuItemsWithSubItems").parent().eq(menuIndex).realHover()
            cy.get("@subMenuItems").eq(subMenuIndex).click()
            verifyTitleAndUrl($subMenuItem.text())
            cy.get("@menuItemsWithSubItems").parent().eq(menuIndex).realHover()
          })
      })
  })

  function verifyTitleAndUrl(expectedText: string) {
    cy.get('.page-title h1').then(($title) => {
      let titleText = $title.text().trim().toLowerCase()
      expect(expectedText.toLowerCase().trim()).to.eq(titleText)
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

