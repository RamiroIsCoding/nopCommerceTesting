describe("Check Notebooks filter by attributes", () => {
  beforeEach(() => {
    cy.visit("/notebooks");
    cy.log("Visiting notebooks page");
  })

  it.only("verify if products contain attributes for each filter", () => {
    const productInfo: Map<string, string[]> = new Map();
    cy.log("Initializing product information map");

    cy.get(".filter-content .item")
      .each(($filter, index) => {
        const filterName = $filter.text().trim();
        applyFilter(index);
        cy.log(`Applying filter: ${filterName}`);

        mapLinkWithComponents(filterName)
          .then((mapLinkWithComponents: Map<string, string>) => {
            mapLinkWithComponents.forEach((productComponent, productLink) => {
              if (productInfo.has(productLink)) {
                const info: string[] = productInfo.get(productLink);
                info.push(filterName);
                productInfo.set(productLink, info);
              } else {
                productInfo.set(productLink, [productComponent]);
              }
            })
          });
        unapplyFilter(index);
      });
    cy.then(() => {
      assertEachProductContainsTheExpectedComponents(productInfo)
    })
  })

  function applyFilter(filterIndex: number) {
    clickFilterAndWaitPageElementsToLoad(filterIndex);
    cy.log("Applying filter")
  }

  function unapplyFilter(filterIndex: number) {
    clickFilterAndWaitPageElementsToLoad(filterIndex);
    cy.log("Unapply filter")
  }

  function clickFilterAndWaitPageElementsToLoad(filterIndex: number) {
    cy.intercept('GET', '**/category/products**').as('filterNetworkCall');
    cy.get(".filter-content .item")
      .eq(filterIndex)
      .click()
    cy.wait('@filterNetworkCall');
    cy.log("wait response");
    cy.get("div .ajax-products-busy")
      .should('have.css', 'display', 'none');
  }

  function mapLinkWithComponents(filterName: string) {
    const component = filterName;
    return cy.get(".product-item h2 > a")
      .then((productsAnchor: JQuery) => {
        const productLinkAndComponentMap: Map<string, string> = new Map();
        productsAnchor.each((_, anchor: HTMLElement) => {
          const link: string = anchor.getAttribute("href");
          productLinkAndComponentMap.set(link, component);
        })
        return productLinkAndComponentMap;
      })
  }

  function assertEachProductContainsTheExpectedComponents
  (productsLinkComponentsMap: Map<string, string[]>) {
    productsLinkComponentsMap.forEach((components: string[], link: string) => {
      cy.visit(link);
      components.forEach((value) => {
        cy.get(".product-specs-box .spec-value").should("contain", value);
      })
    })
  }
})

