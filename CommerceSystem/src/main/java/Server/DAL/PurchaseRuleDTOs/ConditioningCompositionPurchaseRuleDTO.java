package Server.DAL.PurchaseRuleDTOs;

import Server.DAL.PairDTOs.PredPair;
import Server.Domain.ShoppingManager.PurchaseRules.ConditioningCompositionPurchaseRule;
import Server.Domain.ShoppingManager.PurchaseRules.PurchaseRule;
import dev.morphia.annotations.Embedded;
import dev.morphia.annotations.Property;
import org.bson.codecs.pojo.annotations.BsonDiscriminator;

import java.util.List;
import java.util.Vector;

@Embedded
@BsonDiscriminator("ConditioningCompositionPurchaseRuleDTO")

public class ConditioningCompositionPurchaseRuleDTO extends CompoundPurchaseRuleDTO {

    @Property(value = "conditionsMap")
    List<PredPair> conditionsMap;

    public ConditioningCompositionPurchaseRuleDTO() {
        super();
        // For Morphia
    }

    public ConditioningCompositionPurchaseRuleDTO(int id, List<PurchaseRuleDTO> purchaseRules, List<PredPair> conditionsMap) {
        super(id, purchaseRules);
        this.conditionsMap = conditionsMap;
    }

    public List<PredPair> getConditionsMap() {
        return conditionsMap == null ? new Vector<>() : conditionsMap;
    }

    public void setConditionsMap(List<PredPair> conditionsMap) {
        this.conditionsMap = conditionsMap;
    }

    @Override
    public PurchaseRule toConcretePurchaseRule() {
        return new ConditioningCompositionPurchaseRule(this);
    }
}
