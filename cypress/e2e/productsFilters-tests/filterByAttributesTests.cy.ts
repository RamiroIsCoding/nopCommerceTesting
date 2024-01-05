describe("Check Notebooks filter by attributes", () => {
  beforeEach(() => {
    cy.visit("/notebooks");
  })

  it.only("Check if the items contain the expected attribute", () => {
    applyEachFilterAndCheckAttributes();
  });
})

function applyEachFilterAndCheckAttributes() {
  cy.get(".filter-content .item")
    .each(($item, index) => {
      const filterName = $item.text().trim();
      const typeOfFilter = $item.siblings(".name").text()
      applyFilter(index, filterName, typeOfFilter);
    });
}

function applyFilter(filterIndex: number, filterName: string, typeOfFilter: string) {
  cy.intercept('GET', '**/category/products**').as('filterNetworkCall');
  cy.get(".filter-content .item")
    .eq(filterIndex)
    .click()
  cy.wait('@filterNetworkCall');
  cy.get("div .ajax-products-busy")
    .should('have.css', 'display', 'none');
  cy.url()
    .then(urlWithFilters => {
      checkEachProductForAttribute(urlWithFilters, filterName, typeOfFilter);
      cy.get(".filter-content .item").eq(filterIndex).click()
    });
}

function checkEachProductForAttribute(urlWithFilters: string, filterName: string, typeOfFilter: string) {
  cy.get(".product-item").each((_, index) => {
    cy.get(".product-item").eq(index).click()

    cy.get(".product-specs-box .spec-name")
      .contains(typeOfFilter)
      .parent()
      .find(".spec-value")
      .invoke("text")
      .then((specValue) => {
        cy.get(".product-name h1")
          .invoke("text")
          .then((productName) => {
            expect(specValue, `${productName} should have spec: `).to.be.eq(filterName);
          })
      }).then(() => {
      cy.visit(urlWithFilters);
    })
  })
}