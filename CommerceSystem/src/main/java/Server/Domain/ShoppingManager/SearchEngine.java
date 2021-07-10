package Server.Domain.ShoppingManager;


import Server.DAL.DALControllers.DALProxy;
import Server.DAL.DomainDTOs.StoreDTO;
import Server.Domain.CommonClasses.RatingEnum;
import Server.Domain.CommonClasses.Response;
import Server.Domain.ShoppingManager.DTOs.ProductClientDTO;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

/**
 * singleton class
 * supplies searching service for store controller
 */
public class SearchEngine {

    private static volatile SearchEngine searcher = null;

    public static SearchEngine getInstance() {
        if (searcher == null) {
            synchronized (StoreController.class) {
                if (searcher == null)
                    searcher = new SearchEngine();
            }
        }
        return searcher;
    }

    public Response<List<ProductClientDTO>> searchByProductName(String productName) {
        Collection<StoreDTO> stores = DALProxy.getInstance().getAllStores();
        List<ProductClientDTO> productList = new LinkedList<>();
        if (productName != null) {
            for (StoreDTO storeDTO : stores) {
                Store store = new Store(storeDTO);
                for (Product product : store.getInventory().getProducts()) {
                    if (product.getName().equalsIgnoreCase(productName))
                        productList.add(product.getProductDTO());
                }
            }
        }

        return new Response<>(productList, false, "products by name");
    }

    public Response<List<ProductClientDTO>> searchByCategory(String category) {
        Collection<StoreDTO> stores = DALProxy.getInstance().getAllStores();

        List<ProductClientDTO> productList = new LinkedList<>();
        if (category != null) {
            for (StoreDTO storeDTO : stores) {
                Store store = new Store(storeDTO);
                for (Product product : store.getInventory().getProducts())
                    if (product.containsCategory(category))
                        productList.add(product.getProductDTO());
            }
        }

        return new Response<>(productList, false, "products by category");
    }

    public Response<List<ProductClientDTO>> searchByKeyWord(String keyword) {
        Collection<StoreDTO> stores = DALProxy.getInstance().getAllStores();

        List<ProductClientDTO> productList = new LinkedList<>();
        if (keyword != null) {
            for (StoreDTO storeDTO : stores) {
                Store store = new Store(storeDTO);
                for (Product product : store.getInventory().getProducts())
                    if (product.containsKeyword(keyword))
                        productList.add(product.getProductDTO());
            }
        }
        return new Response<>(productList, false, "products by keyword");
    }


    public Response<List<ProductClientDTO>> filterByPriceRange(double lowPart, double highPart) {
        Collection<StoreDTO> stores = DALProxy.getInstance().getAllStores();

        List<ProductClientDTO> productList = new LinkedList<>();
        if (!(lowPart < 0 || highPart < 0 || lowPart > highPart)) {
            for (StoreDTO storeDTO : stores) {
                Store store = new Store(storeDTO);
                for (Product product : store.getInventory().getProducts())
                    if (product.getPrice() >= lowPart && product.getPrice() <= highPart)
                        productList.add(product.getProductDTO());
            }
        }
        return new Response<>(productList, false, "products filtered by price");
    }

    public Response<List<ProductClientDTO>> filterByRating(double rating) {
        Collection<StoreDTO> stores = DALProxy.getInstance().getAllStores();
        List<ProductClientDTO> productList = new LinkedList<>();
        if (rating <= RatingEnum.VERY_HIGH.rate) {
            for (StoreDTO storeDTO : stores) {
                Store store = new Store(storeDTO);
                for (Product product : store.getInventory().getProducts())
                    if (product.getRating() >= rating)
                        productList.add(product.getProductDTO());
            }
        }
        return new Response<>(productList, false, "products filtered by rating");
    }

    public Response<List<ProductClientDTO>> filterByStoreRating(double rating) {
        Collection<StoreDTO> stores = DALProxy.getInstance().getAllStores();

        List<ProductClientDTO> productList = new LinkedList<>();
        if (rating <= RatingEnum.VERY_HIGH.rate) {
            for (StoreDTO storeDTO : stores) {
                Store store = new Store(storeDTO);
                if (store.getRating() >= rating)
                    for (Product product : store.getInventory().getProducts())
                        productList.add(product.getProductDTO());
            }
        }
        return new Response<>(productList, false, "products filtered by store rating");
    }

}







