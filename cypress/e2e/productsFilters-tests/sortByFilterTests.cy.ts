enum SortingOptions {
  Position = "Position",
  NameAscending = "Name: A to Z",
  NameDescending = "Name: Z to A",
  PriceLowToHigh = "Price: Low to High",
  PriceHighToLow = "Price: High to Low",
  CreatedOn = "Created on"
}

describe("Check sort by functionality", () => {
  beforeEach(() => {
    cy.visit("/notebooks");
  })

  it("Check if sort by DESCENDING PRICES work as expected", () => {
    checkOrders(SortingOptions.PriceHighToLow, ".prices span")
  })

  it("Check if sort by ASCENDING PRICES work as expected", () => {
    checkOrders(SortingOptions.PriceLowToHigh, ".prices span")
  })

  it("Check if sort by CREATION works as expected", () => {
    checkOrders(SortingOptions.CreatedOn, ".product-item")
  })

  it("Check if sort by DESCENDING NAMES works as expected", () => {
    checkOrders(SortingOptions.NameDescending, ".product-title")
  })

  it("Check if sort by ASCENDING NAMES works as expected", () => {
    checkOrders(SortingOptions.NameAscending, ".product-title")
  })
})

function checkOrders(sortOption: SortingOptions, locator: string) {
  cy.intercept('GET', '**/category/products**').as('sortProducts');
  cy.get("select[aria-label='Select product sort order']").select(sortOption);
  cy.wait("@sortProducts");

  cy.get(locator)
    .then(($list) => {
      const items: string[] = transformList($list, sortOption);
      assertOrder(items, sortOption);
    })
}

function transformList($list: JQuery<HTMLElement>, sortOption: SortingOptions): string[] {
  let items: string[] = [];
  switch (sortOption) {
    case SortingOptions.PriceHighToLow:
    case SortingOptions.PriceLowToHigh: {
      items = $list.map((index, domElement) => {
        return Cypress.$(domElement).text();
      }).get();
      break;
    }
    case SortingOptions.CreatedOn: {
      items = $list.map((_, item) => {
        return item.getAttribute("data-productid");
      }).get();
      break;
    }
    case SortingOptions.NameDescending:
    case SortingOptions.NameAscending : {
      items = $list.map((_, item) => {
        return item.textContent;
      }).get();
      break;
    }
    default: {
      throw new Error("Unsupported SortingOption");
    }
  }
  return items;
}

function assertOrder(orderedItems: string[], selectOption: SortingOptions) {
  let comparator: (a: string, b:string) => boolean;
  let message = "";

  switch (selectOption) {
    case SortingOptions.PriceLowToHigh: {
      comparator = (a,b) => transformNumber(a) <= transformNumber(b);
      message = "Item should be in ascending price order"
      compareItems(orderedItems, comparator, message);
      break;
    }
    case SortingOptions.PriceHighToLow: {
      comparator = (a,b) => transformNumber(a) >= transformNumber(b);
      message = "Item should be in descending price order"
      compareItems(orderedItems, comparator, message);
      break
    }
    case SortingOptions.CreatedOn: {
      comparator = (a,b) => Number.parseInt(a) >= Number.parseInt(b);
      message = "Item should be in descending chronological order"
      compareItems(orderedItems, comparator, message);
      break
    }
    case SortingOptions.NameAscending: {
      comparator = (a,b) => (a) <= (b);
      message = "Name should be in ascending order"
      compareItems(orderedItems, comparator, message);
      break;
    }
    case SortingOptions.NameDescending: {
      comparator = (a,b) => (a) >= (b);
      message = "Name should be in descending order"
      compareItems(orderedItems, comparator, message);
      break;
    }
    default: {
      break;
    }
  }
}

function transformNumber(item: string) {
  return parseFloat(item.replace("$", "").replace(",", ""));
}

function compareItems(items: string[], comparator: (a: string, b: string) => boolean, message: string) {
  for (let i = 0; i < items.length - 1; i++) {
    const detailMessage = `Comparing ${items[i]} to ${items[i+1]}`;
    expect(comparator(items[i], items[i+1]), `${message}: ${detailMessage}`).to.be.true;
  }
}